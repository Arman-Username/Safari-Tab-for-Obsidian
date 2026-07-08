const { Plugin, Setting, PluginSettingTab } = require('obsidian');

const DEFAULT_SETTINGS = {
    enabled: true,
    hideThreshold: 60,
    animationDuration: 220
};

class SafariTabBarPlugin extends Plugin {
    async onload() {
        await this.loadSettings();

        if (!this.app.isMobile) return;

        this.addSettingTab(new SafariTabBarSettingTab(this.app, this));

        this.addCommand({
            id: 'toggle-safari-tab-bar',
            name: 'Toggle Safari Tab Bar',
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
    }

    enableAutoHide() {
        this.lastScrollY = 0;
        this.isHidden = false;

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', () => this.attachScrollListener())
        );

        this.attachScrollListener();
    }

    disableAutoHide() {
        const tabBar = document.querySelector('.workspace-tab-header-container');
        if (tabBar) tabBar.classList.remove('safari-tab-bar-hidden');
    }

    attachScrollListener() {
        const leaf = this.app.workspace.activeLeaf;
        if (!leaf) return;

        // Improved selectors for both Live Preview and Reading View
        let scroller = leaf.view.containerEl.querySelector('.cm-scroller');

        if (!scroller) {
            // Reading View selectors (more reliable)
            scroller = leaf.view.containerEl.querySelector('.markdown-reading-view .markdown-preview-view') ||
                       leaf.view.containerEl.querySelector('.markdown-reading-view') ||
                       leaf.view.containerEl;
        }

        if (!scroller) return;

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
                this.showTabBar(tabBar);
            } else if (diff > 8 && !this.isHidden) {
                this.hideTabBar(tabBar);
            } else if (diff < -8 && this.isHidden) {
                this.showTabBar(tabBar);
            }

            this.lastScrollY = currentScrollY;
        };

        scroller.addEventListener('scroll', this.scrollHandler, { passive: true });
    }

    hideTabBar(tabBar) {
        tabBar.classList.add('safari-tab-bar-hidden');
        this.isHidden = true;
    }

    showTabBar(tabBar) {
        tabBar.classList.remove('safari-tab-bar-hidden');
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

        containerEl.createEl('h2', { text: 'Safari Tab Bar' });

        new Setting(containerEl)
            .setName('Enable auto-hide on mobile')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enabled)
                .onChange(async (value) => {
                    this.plugin.settings.enabled = value;
                    await this.plugin.saveSettings();
                    if (value) this.plugin.enableAutoHide();
                    else this.plugin.disableAutoHide();
                }));

        new Setting(containerEl)
            .setName('Scroll threshold (px)')
            .setDesc('How far you need to scroll before hiding')
            .addSlider(slider => slider
                .setLimits(20, 150, 10)
                .setValue(this.plugin.settings.hideThreshold)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.hideThreshold = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Animation speed (ms)')
            .addSlider(slider => slider
                .setLimits(100, 400, 20)
                .setValue(this.plugin.settings.animationDuration)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.animationDuration = value;
                    await this.plugin.saveSettings();
                }));
    }
}

module.exports = SafariTabBarPlugin;
