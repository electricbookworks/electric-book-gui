/// <reference path="./typescript-foundation.d.ts" />
import * as TSFoundation from 'TSFoundation';
import {FoundationRevealDialog as Template} from './Templates';

import jQuery = require('jquery');
import signals = require('signals');

export enum DialogEvents {
	Opened = 1,
	Closed
}

/**
 * FoundationRevealDialog is a class that implements
 * a Foundation Reveal dialog. It has a public 'Events' 
 * signals.Signal that receives 'opened' and 'closed'
 * events when the respective action happens on the dialog.
 */
export class FoundationRevealDialog extends Template {
	protected $el : any;
	public Events: signals.Signal;

	constructor(
		openElement?:HTMLElement,
		content?:HTMLElement
	) {
		super();
		this.Events = new signals.Signal();
		this.$el = jQuery(this.el);

		if (openElement) {
			openElement.addEventListener('click', (evt)=>{
				evt.preventDefault();
				evt.stopPropagation();
				this.$el.foundation('open');
			});
		}
		this.$el.bind('open.zf.reveal', (evt:any)=>{
			this.Events.dispatch(DialogEvents.Opened);
		});
		this.$el.bind('closed.zf.reveal', (evt:any)=>{
			this.Events.dispatch(DialogEvents.Closed);
		});
		if (content) {
			this.Set(content);
		}

		// The el must be inserted into the DOM before Foundation is
		// called on it, otherwise Foundation doesn't properly position
		// the dialog.
		document.body.appendChild(this.el);
		// TSFoundation required because Typescript can be really stupid.
		TSFoundation.Reveal(this.$el);
	}
	// Set the content of the dialog to the given
	// element.
	public Set(el: HTMLElement):void {
		this.$.content.innerText = '';
		this.$.content.appendChild(el);
	}
	public Open(): void {
		this.$el.foundation('open');
	}
	public Close(): void {
		this.$el.foundation('close');
	}
}