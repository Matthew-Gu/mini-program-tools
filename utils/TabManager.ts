export class TabManager {
    private static _instance: TabManager;

    private tabData: TabData = {
        tabIndex: 0,
        tabBar: {
            color: '#999999',
            selectedColor: '#32C1FB',
            list: []
        }
    };

    private tabsByRole: Record<number, Tab[]> = {
        1: [
            {
                text: '动态',
                iconPath: '/images/tabbar/index-0.png',
                selectedIconPath: '/images/tabbar/index-1.png',
                pagePath: '/pages/index/index'
            },
            {
                text: '学员',
                iconPath: '/images/tabbar/student-0.png',
                selectedIconPath: '/images/tabbar/student-1.png',
                pagePath: '/pages/student/index'
            },
            {
                text: '我的',
                iconPath: '/images/tabbar/user-0.png',
                selectedIconPath: '/images/tabbar/user-1.png',
                pagePath: '/pages/mine/index'
            }
        ],
        2: [
            {
                text: '门店',
                iconPath: '/images/tabbar/school-0.png',
                selectedIconPath: '/images/tabbar/school-1.png',
                pagePath: '/pages/school/index'
            },
            {
                text: '教师',
                iconPath: '/images/tabbar/teacher-0.png',
                selectedIconPath: '/images/tabbar/teacher-1.png',
                pagePath: '/pages/teacher/index'
            },
            {
                text: '我的',
                iconPath: '/images/tabbar/user-0.png',
                selectedIconPath: '/images/tabbar/user-1.png',
                pagePath: '/pages/mine/index'
            }
        ]
    };

    public static get instance() {
        if (!TabManager._instance) {
            TabManager._instance = new TabManager();
        }
        return TabManager._instance;
    }

    constructor() {
        this.tabBar.list = this.tabsByRole[1];
    }

    get tabIndex(): number {
        return this.tabData.tabIndex;
    }

    get tabBar(): TabBar {
        return this.tabData.tabBar;
    }

    get role(): number {
        return wx.getStorageSync('role') || 1; // 默认角色为1
    }

    // 更新角色对应的 tab
    updateRole(role: number, that?: any): void {
        wx.setStorageSync('role', role);
        const currentTabs = this.tabsByRole[role];
        if (currentTabs) {
            this.tabBar.list = currentTabs;
            this.updateIndex(0, that);
        }
    }

    // 更新当前的 tab 索引
    updateIndex(index: number, that: any): void {
        this.tabData.tabIndex = index;
        if (that) {
            this.updateTab(that);
        }
    }

    // 更新底部 tab 栏
    private updateTab(that: any): void {
        if (that.getTabBar instanceof Function && that.getTabBar()) {
            that.getTabBar().setData(this.tabData);
        }
    }
}

interface TabData {
    tabIndex: number;
    tabBar: TabBar;
}

interface TabBar {
    color: string;
    selectedColor: string;
    list: Tab[];
}

interface Tab {
    text: string;
    iconPath: string;
    selectedIconPath: string;
    pagePath: string;
}
