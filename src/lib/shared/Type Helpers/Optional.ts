export class Optional<T> {

    private value: T | undefined;
    private assigned: boolean;

    public constructor(value?:T){
        if(value){
            this.value = value;
            this.assigned = true;
        } else {
            this.value = undefined;
            this.assigned = false;
        }
    }

    public hasValue(): boolean {
        return this.assigned;
    }

    public getValue(): T {
        if (!this.hasValue()){
            throw new Error('pelaste');
        }
        return this.value as T;
    }
}