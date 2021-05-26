import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {money} from '@ecodev/natural';

@Component({
    selector: 'app-create-refund',
    templateUrl: './create-refund.component.html',
    styleUrls: ['./create-refund.component.scss'],
})
export class CreateRefundComponent implements OnInit {
    /**
     * Form for ExpenseClaimInput
     */
    public readonly form: FormGroup = this.fb.group({
        amount: ['', [Validators.required, Validators.min(1), money]],
        name: ['Demande de remboursement', [Validators.required, Validators.maxLength(50)]],
        description: ['', []],
    });

    constructor(@Inject(MAT_DIALOG_DATA) public readonly data: any, private readonly fb: FormBuilder) {}

    public ngOnInit(): void {}
}
