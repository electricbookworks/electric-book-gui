export class DirModel {
	constructor(protected parent: DirModel, protected name: string, protected state:FileState) {}
}