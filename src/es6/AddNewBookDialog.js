class AddNewBookDialog {
	constructor(parent) {
		[this.el, this.$] = DTemplate(`AddNewBookDialog`);
		Eventify(this.el, {
			'choseType': function() {
				let newBook = this.$.newBookRadio.checked;
				let collaborate = this.$.collaborateRadio.checked;
				if (!newBook && !collaborate) {
					alert(`You need to choose one or the other`);
					return;
				}
				if (newBook) {
					this.$.newBook.style.display = 'block';
					this.$.repo_name.focus();
				} else {
					this.$.collaborate.style.display = 'block';
					this.$.collaborate_repo.focus();
				}
				this.$.chooseType.style.display = 'none';
			}
		}, this);

		jQuery(parent).bind(`open.zf.reveal`, (evt)=>{
			this.$.chooseType.style.display = 'block';
			this.$.newBookRadio.checked = false;
			this.$.collaborateRadio.checked = false;

			this.$.newBook.style.display = 'none';
			this.$.repo_name.value = '';

			this.$.collaborate.style.display = 'none';
			this.$.collaborate_repo.value = '';
		});

		parent.appendChild(this.el);
	}
	show() {

	}
}

window.AddNewBookDialog = AddNewBookDialog;