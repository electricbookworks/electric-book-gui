export class ImageIdentify {
	static isImage(name : string) : boolean {
		let imgRegexp = new RegExp(`.*\.(jpg|png|tiff|svg|gif)$`);
		return imgRegexp.test(name);
	}
}