import { Component, OnInit } from '@angular/core';
import { BookableService } from '../../../admin/bookables/services/bookable.service';
import { QueryVariablesManager } from '../../classes/query-variables-manager';
import { AppDataSource } from '../../services/data.source';
import { BookablesQuery, BookablesQueryVariables } from '../../generated-types';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'app-select-admin-approved-modal',
    templateUrl: './select-admin-approved-modal.component.html',
})
export class SelectAdminApprovedModalComponent implements OnInit {

    public servicesDataSource;
    public storagesDataSource;
    public selection = new SelectionModel<BookablesQuery['bookables']['items']>(true, []);

    constructor(private bookableService: BookableService) {
    }

    ngOnInit() {
        const serviceVariables = BookableService.adminApprovedByTag('6007');
        const qvmServices = new QueryVariablesManager<BookablesQueryVariables>();
        qvmServices.set('variables', serviceVariables);
        this.bookableService.getAll(qvmServices).subscribe(result => {
            this.servicesDataSource = new AppDataSource(result);
        });

        const storageVariables = BookableService.adminApprovedByTag('6008');
        const qvmStorage = new QueryVariablesManager<BookablesQueryVariables>();
        qvmStorage.set('variables', storageVariables);
        this.bookableService.getAll(qvmStorage).subscribe(result => {
            this.storagesDataSource = new AppDataSource(result);
        });

    }

}
