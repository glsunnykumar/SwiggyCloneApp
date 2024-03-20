export class User{
    constructor(
        public email :string,
        public phone :string,
        
        public uid?:string,
        public name? :string,
        public type?: string,
        public status?: string
    ){}
}