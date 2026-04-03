import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { 
  cilList, cilPeople, cilSettings, cilImage, cilAccountLogout, 
  cilMenu, cilPlus, cilTrash, cilSave, cilStar, cilCheckCircle, 
  cilInfo, cilSpeedometer, cilBriefcase, cilCalendar, cilDollar, 
  cilTask, cilUser 
} from '@coreui/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: false,
  encapsulation: ViewEncapsulation.None
})
export class Admin implements OnInit {
  public sidebarVisible: boolean = true;
  public adminName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    public iconSet: IconSetService
  ) {
    this.iconSet.icons = { 
      cilList, cilPeople, cilSettings, cilImage, cilAccountLogout, 
      cilMenu, cilPlus, cilTrash, cilSave, cilStar, cilCheckCircle, 
      cilInfo, cilSpeedometer, cilBriefcase, cilCalendar, cilDollar, 
      cilTask, cilUser 
    };
  }

  ngOnInit(): void {
    this.adminName = this.authService.getAdminName();
  }

  public hasAccess(menu: string): boolean {
    const allowed = this.authService.getAllowedMenus();
    if (allowed === 'all') return true;
    const menuList = allowed.toLowerCase().split(',').map(m => m.trim());
    return menuList.includes(menu.toLowerCase());
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
