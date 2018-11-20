import { Component, EventEmitter, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { isUndefined, isString } from 'lodash';
import { QueryList } from '@angular/core';
import { AfterViewInit, ContentChildren } from '@angular/core';
import { ColumnsPickerColumnDirective } from './columns-picker-column.directive';

@Component({
    selector: 'app-columns-picker',
    templateUrl: './columns-picker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnsPickerComponent implements AfterViewInit {

    /**
     * Emit a list of column keys whenever the selection changes
     */
    @Output() selectionChange = new EventEmitter<Iterable<string>>();

    @ContentChildren(ColumnsPickerColumnDirective)
    public availableColumns: QueryList<ColumnsPickerColumnDirective>;

    constructor(private changeDetectorRef: ChangeDetectorRef) {

    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.updateColumns();
            this.changeDetectorRef.detectChanges();
        });
    }

    updateColumns(): void {
        const selectedColumns = this.availableColumns.filter(col => col.show).map(col => col.key);

        this.selectionChange.emit(selectedColumns);
    }
}