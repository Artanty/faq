export interface Topic {
id: number;
name: string;
folderId: number;
userId: number;
}

export interface Folder {
id: number;
name: string;
service: number;
userId: number
}  

export interface Dict {
folders: Folder[];
topics: Topic[];
}