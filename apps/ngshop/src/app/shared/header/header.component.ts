import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@bluebits/users';

@Component({
    selector: 'ngshop-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
    isLogin = false;

    constructor(private router: Router, private authService: AuthService) {}

    ngOnInit(): void {
        this.checkLogin();
    }

    private checkLogin() {
        const result = localStorage.getItem(`jwtToken`);
        if (result) {
            this.isLogin = true;
        }
    }

    directToLogin() {
        this.router.navigate(['/login']);
        // this.isLogin = false;
        // console.log(this.isLogin);
        // this.ngOnInit();
    }

    directToHomepage() {
        this.authService.logout();
        this.isLogin = false;
        this.router.navigate(['']);
    }
}
