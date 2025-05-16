import { Component } from "@angular/core";
import { AccountService } from "../_services";
import { Account } from "../_models";

@Component({ templateUrl: "details.component.html" })
export class DetailsComponent {
    account: Account | null;

    constructor(private accountService: AccountService) {
        this.account = this.accountService.accountValue;
    }
}