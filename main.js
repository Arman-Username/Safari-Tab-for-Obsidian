const { Plugin, Setting, PluginSettingTab } = require('obsidian');

const DEFAULT_SETTINGS = {
    enabled: true,
    hideThreshold: 50,
    animationDuration: 200
};

class SafariTabBarPlugin extends Plugin {
    async onload() {
        await this.loadSettings();

        // Only run on mobile/tablet
        if (!this.app.isMobile) {
            console.log('Safari Tab Bar: Disabled on desktop');
            return;
        }

        this.addSettingTab(new SafariTabBarSettingTab(this.app, this));

        this.addCommand({
            id: 'toggle-safari-tab-bar',
            name: 'Toggle Safari Tab Bar Auto-Hide',
            callback: () => {
                this.settings.enabled = !this.settings.enabled;
                this.saveSettings();
                if (this.settings.enabled) {
                    this.enableAutoHide();
                } else {
                    this.disableAutoHide();
                }
            }
        });

        if (this.settings.enabled) {
            this.enableAutoHide();
        }

        console.log('Safari Tab Bar plugin loaded');
    }

    enableAutoHide() {
        this.lastScrollY = 0;
        this.isHidden = false;

        // Listen for active leaf changes
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => {
                this.attachScrollListener();
            })
        );

        // Attach to current leaf
        this.attachScrollListener();
    }

    disableAutoHide() {
        if (this.scrollHandler) {
            const tabBar = document.querySelector('.workspace-tab-header-container');
            if (tabBar) {
                tabBar.style.transition = '';
                tabBar.style.transform = '';
                tabBar.style.opacity = '';
            }
            this.scrollHandler = null;
        }
    }

    attachScrollListener() {
        const leaf = this.app.workspace.activeLeaf;
        if (!leaf) return;

        // Try to find the scrollable content area
        const scroller = leaf.view.containerEl.querySelector('.cm-scroller') ||
                        leaf.view.containerEl.querySelector('.markdown-reading-view') ||
                        leaf.view.containerEl;

        if (!scroller) return;

        // Remove old listener if exists
        if (this.scrollHandler) {
            scroller.removeEventListener('scroll', this.scrollHandler);
        }

        this.scrollHandler = (e) => {
            if (!this.settings.enabled) return;

            const currentScrollY = e.target.scrollTop;
            const tabBar = document.querySelector('.workspace-tab-header-container');
            if (!tabBar) return;

            const diff = currentScrollY - this.lastScrollY;

            if (currentScrollY <= this.settings.hideThreshold) {
                // Near the top → show tab bar
                this.showTabBar(tabBar);
            } else if (diff > 5 && !this.isHidden) {
                // Scrolling down → hide
                this.hideTabBar(tabBar);
            } else if (diff < -5 && this.isHidden) {
                // Scrolling up → show
                this.showTabBar(tabBar);
            }

            this.lastScrollY = currentScrollY;
        };

        scroller.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    hideTabBar(tabBar) {
        tabBar.style.transition = `transform ${this.settings.animationDuration}ms ease, opacity ${this.settings.animationDuration}ms ease`;
        tabBar.style.transform = 'translateY(-100%)';
        tabBar.style.opacity = '0';
        this.isHidden = true;
    }

    showTabBar(tabBar) {
        tabBar.style.transition = `transform ${this.settings.animationDuration}ms ease, opacity ${this.settings.animationDuration}ms ease`;
        tabBar.style.transform = 'translateY(0)';
        tabBar.style.opacity = '1';
        this.isHidden = false;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        this.disableAutoHide();
    }
}

class SafariTabBarSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Safari Tab Bar Settings' });

        new Setting(containerEl)
            .setName('Enable auto-hide')
            .setDesc('Hide tab bar when scrolling down on mobile/iPad')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enabled)
                .onChange(async (value) => {
                    this.plugin.settings.enabled = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        this.plugin.enableAutoHide();
                    } else {
                        this.plugin.disableAutoHide();
                    }
                }));

        new Setting(containerEl)
            .setName('Hide threshold (px)')
            .setDesc('How far you need to scroll before hiding starts')
            .addSlider(slider => slider
                .setLimits(0, 150, 10)
                .setValue(this.plugin.settings.hideThreshold)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.hideThreshold = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Animation speed (ms)')
            .setDesc('How fast the tab bar hides/shows')
            .addSlider(slider => slider
                .setLimits(100, 500, 50)
                .setValue(this.plugin.settings.animationDuration)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.animationDuration = value;
                    await this.plugin.saveSettings();
                }));
    }
}

module.exports = SafariTabBarPlugin;