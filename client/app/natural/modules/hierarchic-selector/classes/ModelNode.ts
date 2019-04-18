import { BehaviorSubject } from 'rxjs';
import { NaturalHierarchicConfiguration } from './HierarchicConfiguration';

export class HierarchicModelNode {

    public childrenChange: BehaviorSubject<HierarchicModelNode[]> = new BehaviorSubject<HierarchicModelNode[]>([]);

    constructor(public model: any,
                public config: NaturalHierarchicConfiguration) {
    }

    get children(): HierarchicModelNode[] {
        return this.childrenChange.getValue();
    }
}
