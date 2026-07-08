/* === Liquid Glass Tab Bar === */
.workspace-tab-header-container {
    background: rgba(var(--color-base-00-rgb), 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(var(--color-base-30-rgb), 0.6);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1) inset;
    transition: height 0.22s ease, 
                transform 0.22s ease, 
                opacity 0.22s ease,
                min-height 0.22s ease;
    overflow: hidden;
    will-change: height, transform, opacity;
}

/* Individual tabs */
.workspace-tab-header {
    background: transparent;
    border-radius: 10px;
    margin: 5px 3px;
    padding: 0 10px;
    transition: background 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid transparent;
}

/* Inactive tabs */
.workspace-tab-header:not(.is-active) {
    background: rgba(var(--color-base-10-rgb), 0.4);
    border: 1px solid rgba(var(--color-base-30-rgb), 0.3);
}

/* Active tab - slightly stronger glass effect */
.workspace-tab-header.is-active {
    background: rgba(var(--color-base-00-rgb), 0.85);
    border: 1px solid rgba(var(--color-base-30-rgb), 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    font-weight: 500;
}

/* Hover effect */
.workspace-tab-header:hover:not(.is-active) {
    background: rgba(var(--color-base-10-rgb), 0.6);
    border-color: rgba(var(--color-base-30-rgb), 0.4);
}

/* Close button */
.workspace-tab-header .workspace-tab-header-inner-close-button {
    opacity: 0.6;
    transition: opacity 0.2s ease;
}

.workspace-tab-header:hover .workspace-tab-header-inner-close-button {
    opacity: 1;
}

/* === Hidden state (from the plugin) === */
.workspace-tab-header-container.safari-tab-bar-hidden {
    height: 0 !important;
    min-height: 0 !important;
    transform: translateY(-100%);
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    border-bottom: none;
}
