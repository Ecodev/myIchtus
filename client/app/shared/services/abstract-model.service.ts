import { Apollo } from 'apollo-angular';
import { Observable, OperatorFunction, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Literal } from '../types';
import { DocumentNode } from 'graphql';
import { debounce, defaults, isArray, merge, mergeWith, pick } from 'lodash';
import { Utility } from '../classes/utility';
import { FetchResult } from 'apollo-link';
import { QueryVariablesManager } from '../classes/query-variables-manager';

interface VariablesWithInput {
    input: Literal;
}

export abstract class AbstractModelService<Tone,
    Vone,
    Tall,
    Vall,
    Tcreate,
    Vcreate extends VariablesWithInput,
    Tupdate,
    Vupdate extends { id: string; input: Literal; },
    Tdelete> {

    /**
     * Stores the debounced update function
     */
    protected debouncedUpdateCache = {};

    private creatingIdTmp = 1;

    /**
     * Store the creation mutations that are pending
     */
    private creatingCache: Literal = {};

    public static mergeOverrideArray(dest, src) {
        if (isArray(src)) {
            return src;
        }
    }

    constructor(protected readonly apollo: Apollo,
                protected readonly name: string,
                protected readonly oneQuery: DocumentNode | null,
                protected readonly allQuery: DocumentNode | null,
                protected readonly createMutation: DocumentNode | null,
                protected readonly updateMutation: DocumentNode | null,
                protected readonly deleteMutation: DocumentNode | null) {
    }

    /**
     * Return empty object with some default values
     *
     * This is typically useful when showing a form for creation
     */
    public getEmptyObject(): Vcreate['input'] | Vupdate['input'] {
        return {};
    }

    /**
     * Fetch an object
     */
    public getOne(id: string): Observable<Tone> {
        this.throwIfObservable(id);
        this.throwIfNotQuery(this.oneQuery);

        return this.apollo.query<Tone, Vone>({
            query: this.oneQuery,
            variables: this.getVariablesForOne(id),
        }).pipe(this.mapOne());
    }

    public getAll(queryVariablesManager: QueryVariablesManager<Vall>): Observable<Tall> {
        this.throwIfNotQuery(this.allQuery);

        const manager = new QueryVariablesManager<Vall>(queryVariablesManager); // "copy" qvm
        manager.merge('context', this.getContextForAll());

        return this.apollo.query<Tall, Vall>({
            query: this.allQuery,
            variables: manager.variables.value,
        }).pipe(this.mapAll());
    }

    /**
     * This functions allow to fastly create or update objects.
     * Manages a "creation is pending" status, and update when creation is ready.
     * Uses regular update/updateNow and create methods.
     * Used mainly when editing multiple objects in same controller (like in editable arrays)
     */
    public createOrUpdate(object: Literal, now: boolean = false): Observable<Tcreate | Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.createMutation);
        this.throwIfNotQuery(this.updateMutation);

        // If creation is pending, listen to creation observable and when ready, fire update
        if (object.creatingId) {
            const resultObservable = new Subject<Tupdate>();
            this.creatingCache[object.creatingId].subscribe(createdItem => {
                this.update(createdItem).subscribe(updatedModel => {
                    resultObservable.next(updatedModel);
                    resultObservable.complete();
                });
            });

            return resultObservable;
        }

        // If object has Id, just save it
        if (object.id) {
            if (now) { // used mainly for tests, because lodash debounced used in update() does not work fine with fakeAsync and tick()
                return this.updateNow(object);
            } else {
                return this.update(object);
            }
        }

        // If object was not saving, and has no ID, create it

        // Increment temporary id and set it as object attribute "creatingId"
        this.creatingIdTmp++;
        const id = this.creatingIdTmp;
        object.creatingId = this.creatingIdTmp;
        this.creatingCache[id] = new Subject<Tcreate>(); // stores creating observable in a cache

        return this.create(object).pipe(map(newObject => {
            delete newObject['creatingId']; // remove temp id
            this.creatingCache[id].next(newObject); // update creating observable
            this.creatingCache[id].complete(); // unsubscribe everybody
            delete this.creatingCache[id]; // remove from cache

            return newObject;
        }));

    }

    /**
     * Create an object in DB and then refetch the list of objects
     * When creation starts, object receives an unique negative ID and the mutation observable is stored in a cache
     * When creation is ready, the cache is removed and the model received his real ID
     */
    public create(object: Literal): Observable<Tcreate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.createMutation);

        const variables = merge({}, {input: this.getInput(object)}, this.getContextForCreation(object));

        const observable = new Subject<Tcreate>();

        this.apollo.mutate<Tcreate, Vcreate>({
            mutation: this.createMutation,
            variables: variables,
        }).subscribe(result => {
            const newObject = this.mapCreation(result);
            observable.next(mergeWith(object, newObject, AbstractModelService.mergeOverrideArray));
            observable.complete();
        });

        return observable.asObservable(); // hide type Subject and prevent user to miss use .next() or .complete() functions
    }

    /**
     * Get item key to be used as cache index : action-123
     */
    protected getKey(object: Literal) {

        if (!object.__typename) {
            return 'default' + '-' + object.id;
        }

        return object.__typename + '-' + object.id;
    }

    /**
     * Update an object
     */
    public update(object: Literal): Observable<Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.updateMutation);

        const resultObservable = new Subject<Tupdate>();
        const objectKey = this.getKey(object);

        // Keep a single instance of the debounced update function
        if (!this.debouncedUpdateCache[objectKey]) {

            // Create debounced update function
            this.debouncedUpdateCache[objectKey] = debounce(o => {
                this.updateNow(o).subscribe(data => {
                    resultObservable.next(data);
                    resultObservable.complete();
                });
            }, 2000); // Wait 2sec.
        }

        // Call debounced update function each time we call this update() function
        this.debouncedUpdateCache[objectKey](object);

        // Return and observable that is updated when mutation is done
        return resultObservable;
    }

    /**
     * Update an object
     */
    public updateNow(object: Literal): Observable<Tupdate> {
        this.throwIfObservable(object);
        this.throwIfNotQuery(this.updateMutation);

        const observable = new Subject<Tupdate>();
        const variables = {
            id: object.id as string,
            input: this.getInput(object),
        } as Vupdate;

        this.apollo.mutate<Tupdate, Vupdate>({
            mutation: this.updateMutation,
            variables: variables,
        }).subscribe((result: any) => {
            result = this.mapUpdate(result);
            mergeWith(object, result, AbstractModelService.mergeOverrideArray);
            observable.next(result);
            observable.complete(); // unsubscribe all after first emit, nothing more will come;
        });

        return observable.asObservable();  // hide type Subject and prevent user to miss use .next() or .complete() functions
    }

    /**
     * Delete objects and then refetch the list of objects
     */
    public delete(objects: { id: string; }[]): Observable<Tdelete> {
        this.throwIfObservable(objects);
        this.throwIfNotQuery(this.deleteMutation);

        const ids = objects.map(o => o.id);

        const observable = new Subject<Tdelete>();

        this.apollo.mutate<Tdelete, { ids: string[] }>({
            mutation: this.deleteMutation,
            variables: {
                ids: ids,
            },
        }).subscribe((result: any) => {
            result = this.mapDelete(result);
            observable.next(result);
            observable.complete();
        });

        return observable.asObservable();
    }

    /**
     * This is used to extract only the fetched object out of the entire fetched data
     */
    protected mapOne(): OperatorFunction<FetchResult<Tone>, Tone> {
        return map((result) => {
            return result.data[this.name];
        });
    }

    /**
     * This is used to extract only the array of fetched objects out of the entire fetched data
     */
    protected mapAll(): OperatorFunction<FetchResult<any>, Tall> {

        const plural = Utility.makePlural(this.name);
        return map(result => {
            return result.data[plural];
        });
    }

    /**
     * This is used to extract only the created object out of the entire fetched data
     */
    protected mapCreation(result): OperatorFunction<FetchResult<any>, Tcreate> {
        const name = 'create' + Utility.upperCaseFirstLetter(this.name);
        return result.data[name];
    }

    /**
     * This is used to extract only the updated object out of the entire fetched data
     */
    protected mapUpdate(result): OperatorFunction<FetchResult<any>, Tupdate> {
        const name = 'update' + Utility.upperCaseFirstLetter(this.name);
        return result.data[name];
    }

    /**
     * This is used to extract only flag when deleting an object
     */
    protected mapDelete(result): OperatorFunction<FetchResult<any>, Tdelete> {
        const name = 'delete' + Utility.makePlural(Utility.upperCaseFirstLetter(this.name));
        return result.data[name];
    }

    /**
     * Return an object that match the GraphQL input type.
     * It creates an object with manually filled data and add uncompleted data (like required attributes that can be empty strings)
     */
    protected getInput(object: Literal): Vcreate['input'] | Vupdate['input'] {

        // Convert relations to their IDs for mutation
        object = Utility.relationsToIds(object);

        // Pick only attributes that we can find in the empty object
        // In other words, prevent to select data that has unwanted attributes
        const emptyObject = this.getEmptyObject();
        let input = pick(object, Object.keys(emptyObject));

        // Complete a potentially uncompleted object with default values
        input = defaults(input, emptyObject);

        return input;
    }

    /**
     * Merge given ID with context if there is any
     */
    private getVariablesForOne(id: string): Vone {
        return merge({}, {id: id}, this.getContextForOne());
    }

    /**
     * Returns an additional context to be used in variables when getting a single object
     *
     * This is typically a site or state ID, and is needed to get appropriate access rights
     */
    protected getContextForOne(): Vone {
        return {} as Vone;
    }

    /**
     * Returns an additional context to be used in variables.
     *
     * This is typically a site or state ID, but it could be something else to further filter the query
     */
    protected getContextForAll(): Vall {
        return {} as Vall;
    }

    /**
     * Returns an additional context to be used when creating an object
     *
     * This is typically a site or state ID
     */
    protected getContextForCreation(object: Literal): Vcreate {
        return {} as Vcreate;
    }

    /**
     * Throw exception to prevent executing null queries
     */
    private throwIfNotQuery(query): void {
        if (!query) {
            throw new Error('GraphQL query for this method was not configured in this service constructor');
        }
    }

    /**
     * Throw exception to prevent executing null queries
     */
    protected throwIfObservable(value): void {
        if (value instanceof Observable) {
            throw new Error('Cannot use Observable as variables. Instead you should use .subscribe() to call the method with a real value');
        }
    }

}


