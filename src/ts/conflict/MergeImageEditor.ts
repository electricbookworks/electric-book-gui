import {API} from '../API';
import {Context} from '../Context';
import {conflict_MergeImageEditor as Template} from '../Templates';
import {EBW} from '../EBW';

const VERSION_OUR = "our-head";
const VERSION_THEIR = "their-head";

class MergeImageEditorView {
	protected img : HTMLImageElement;
	protected selected: boolean;
	constructor(protected context: Context, parent:HTMLElement, protected path: string, protected version: string, protected selected: boolean) {
		this.img = document.createElement('img') as HTMLImageElement;

		this.img.classList.add(`merge-image`);
		this.img.classList.add(version);
		if (this.selected) {
			this.img.classList.add('selected');
		}
		this.img.src=`/www-version/${version}/${this.context.RepoOwner}/${this.context.RepoName}/${path}`;

		this.img.addEventListener('click', (evt)=>{
			evt.preventDefault();
			evt.stopPropagation();
			if (this.selected) {
				return;
			}
			this.img.dispatchEvent(new CustomEvent(`ImageSelected`, { bubbles:true,cancelable:true,detail:{
				Path: this.path,
				Version: this.version
			}
			}));
		})
		parent.appendChild(this.img);
	}
	select(s : boolean) {
		if (s==this.selected) {
			return;
		}
		if (s) {
			this.img.classList.add('selected');
		} else {
			this.img.classList.remove('selected');
		}
		this.selected = s;
	}
}

/**
 * MergeImageEditor displays two images - ours and theirs - to the user, allowing them to select
 * the one they wish to keep as the merge result.
 */
export class MergeImageEditor extends Template {
	protected ours : MergeImageEditorView;
	protected theirs: MergeImageEditorView;
	protected apiInFlight : boolean;

	constructor(protected context: Context, parent: HTMLElement, path: string) {
		super();
		EBW.API().IsOurHeadInWd(context.RepoOwner, context.RepoName, path)
		.then(
			(args)=>{
				let oursInWd:boolean = args[0] as boolean;
				this.ours = new MergeImageEditorView(context, this.$.ours, path, VERSION_OUR, oursInWd);
				this.theirs = new MergeImageEditorView(context,this.$.theirs, path, VERSION_THEIR, !oursInWd);
				this.apiInFlight = false;
				this.el.addEventListener(`ImageSelected`, (evt:CustomEvent)=>{
					if (this.apiInFlight) return;	// can't have two api calls in flight at the same time

					let api = EBW.API();
					let p : Promise<void>;
					let ourVersion = evt.detail.Version == VERSION_OUR;
					this.apiInFlight = true;
					if (ourVersion) {
						p = api.SaveOurHeadToWd(context.RepoOwner, context.RepoName, path);
					} else {
						p = api.SaveTheirHeadToWd(context.RepoOwner, context.RepoName, path);
					}
					p.then(
						()=>{
							let ours = evt.detail.V
							this.ours.select(ourVersion);
							this.theirs.select(!ourVersion);
							this.apiInFlight = false;
						})
					.catch(
						(err)=>{
							EBW.Error(err);
							console.error(err);
							this.apiInFlight = false;
						});
				});
			})
		.catch(
			(err)=>{
				EBW.Error(err);
				console.error(err);
			});

		parent.appendChild(this.el);
	}
	
}