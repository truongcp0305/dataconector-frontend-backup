<template>
    <v-card flat v-show="isShow" class="card-icon-material">
        <div v-if="showTab">
            <v-tabs v-model="tab" grow>
                <v-tab v-for="item in items" :key="item">
                    {{ item }}
                </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item class="tab-item">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="searchIconKeyword"
                                solo
                                :label="$t('common.quickSearch')"
                                flat
                                dense
                                @input="searchIcon"
                                append-icon="mdi-magnify"
                                class="sym-small-size bg-grey pl-4 pr-4"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row class="ml-0 mr-0">
                        <v-col
                            cols="2"
                            class="pt-0 pb-0 text-center single-icon"
                            v-for="icon in listIconToShow"
                            :key="icon"
                            @click="selectIcon(icon)"
                        >
                            <v-icon class="headline">{{ icon }}</v-icon>
                        </v-col>
                    </v-row>
                </v-tab-item>
                <!-- Tab chèn link -->
                <v-tab-item
                    class="text-center tab-item"
                    style="min-height: 200px"
                >
                    <v-text-field
                        v-model="link"
                        solo
                        :label="$t('common.quickSearch')"
                        flat
                        dense
                        append-icon="mdi-link-variant"
                        class="sym-small-size bg-grey pl-4 pr-4 mt-3"
                    ></v-text-field>
                    <div v-if="!!link" class="w-100">
                        <img
                            :src="link"
                            width="150"
                            max-height="150"
                            class="mt-3"
                            style="max-width: 150px"
                        />
                    </div>
                </v-tab-item>
                <v-tab-item class="tab-item">
                    <Upload ref="fileUpload" @selectFile="selectImage"></Upload>
                </v-tab-item>
            </v-tabs-items>
        </div>
        <div v-else>
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="searchIconKeyword"
                        solo
                        :label="$t('common.quickSearch')"
                        flat
                        dense
                        @input="searchIcon"
                        append-icon="mdi-magnify"
                        class="sym-small-size bg-grey pl-4 pr-4"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row class="ml-0 mr-0">
                <v-col
                    cols="2"
                    class="pt-0 pb-0 text-center single-icon"
                    v-for="icon in listIconToShow"
                    :key="icon"
                    @click="selectIcon(icon)"
                >
                    <v-icon class="headline">{{ icon }}</v-icon>
                </v-col>
            </v-row>
        </div>
    </v-card>
</template>

<script>
import Upload from './Upload';
export default {
    name: 'MaterialIcon',
    components: {
        Upload,
    },
    props: {
        /**
         * Đánh dấu biến này bằng true khi nhúng compon này vào compon khác mà muốn nó luôn hiển thị
         * nếu ở dạng popup thì mặc định là false
         */
        showTab: {
            type: Boolean,
            default: false,
        },
        alwaysShow: {
            type: Boolean,
            default: false,
        },
        defaultIcon: {
            type: String,
            default: '',
        },
        keyInstance: {
            type: Number,
            default: Date.now(),
        },
        minWidth: {
            type: Number,
            default: 300,
        },
        maxWidth: {
            type: Number,
            default: 300,
        },
        maxHeight: {
            type: Number,
            default: 400,
        },
        float: {
            type: Boolean,
            default: false,
        },
    },

    data: function () {
        return {
            listIcon: `
                mdi-account,mdi-account-alert,mdi-account-box,mdi-account-box-outline,mdi-account-check,
                mdi-account-circle,mdi-account-key,mdi-account-minus,mdi-account-multiple,
                mdi-account-multiple-outline,mdi-account-multiple-plus,mdi-account-network,mdi-account-outline,
                mdi-account-plus,mdi-account-remove,mdi-account-search,mdi-account-star,
                mdi-account-switch,mdi-airballoon,mdi-airplane,mdi-airplane-off,mdi-alarm,mdi-alarm-check,
                mdi-alarm-multiple,mdi-alarm-off,mdi-alarm-plus,mdi-album,mdi-alert,mdi-alert-box,mdi-alert-circle,
                mdi-alert-octagon,mdi-alpha,mdi-alphabetical,mdi-amazon,mdi-ambulance,
                mdi-android,mdi-android-debug-bridge,mdi-android-studio,mdi-apple,mdi-apple-finder,mdi-apple-ios,
                mdi-apple-safari,mdi-apps,mdi-archive,mdi-arrange-bring-forward,
                mdi-arrange-bring-to-front,mdi-arrange-send-backward,mdi-arrange-send-to-back,mdi-arrow-all,
                mdi-arrow-bottom-left,mdi-arrow-bottom-right,mdi-arrow-collapse,mdi-arrow-down,mdi-arrow-down-bold,
                mdi-arrow-down-bold-circle,mdi-arrow-down-bold-circle-outline,mdi-arrow-down-bold-hexagon-outline,
                mdi-arrow-expand,mdi-arrow-left,mdi-arrow-left-bold,mdi-arrow-left-bold-circle,mdi-arrow-left-bold-circle-outline,
                mdi-arrow-left-bold-hexagon-outline,mdi-arrow-right,mdi-arrow-right-bold,mdi-arrow-right-bold-circle,
                mdi-arrow-right-bold-circle-outline,mdi-arrow-right-bold-hexagon-outline,mdi-arrow-top-left,
                mdi-arrow-top-right,mdi-arrow-up,mdi-arrow-up-bold,mdi-arrow-up-bold-circle,mdi-arrow-up-bold-circle-outline,
                mdi-arrow-up-bold-hexagon-outline,mdi-at,mdi-attachment,mdi-auto-fix,mdi-auto-upload,
                mdi-baby,mdi-backburger,mdi-backup-restore,mdi-bank,mdi-barcode,mdi-barley,mdi-barrel,
                mdi-basket,mdi-basket-fill,mdi-basket-unfill,mdi-battery,mdi-battery-10,mdi-battery-20,mdi-battery-30,
                mdi-battery-40,mdi-battery-50,mdi-battery-60,mdi-battery-70,mdi-battery-80,mdi-battery-90,mdi-battery-alert,
                mdi-battery-charging-100,mdi-battery-charging-20,mdi-battery-charging-30,mdi-battery-charging-40,mdi-battery-charging-60,
                mdi-battery-charging-80,mdi-battery-charging-90,mdi-battery-minus,mdi-battery-negative,mdi-battery-outline,mdi-battery-plus,
                mdi-battery-positive,mdi-battery-unknown,mdi-beach,mdi-beaker,mdi-beaker-outline,
                mdi-beer,mdi-bell,mdi-bell-off,mdi-bell-outline,mdi-bell-ring,mdi-bell-ring-outline,mdi-bell-sleep,
                mdi-beta,mdi-bike,mdi-binoculars,mdi-bio,mdi-biohazard,mdi-bitbucket,mdi-black-mesa,mdi-blinds,
                mdi-block-helper,mdi-blogger,mdi-bluetooth,mdi-bluetooth-audio,mdi-bluetooth-connect,mdi-bluetooth-settings,
                mdi-bluetooth-transfer,mdi-blur,mdi-blur-linear,mdi-blur-off,mdi-blur-radial,mdi-bone,mdi-book,mdi-book-multiple,
                mdi-book-open,mdi-book-variant,mdi-bookmark,mdi-bookmark-check,mdi-bookmark-music,
                mdi-bookmark-outline,mdi-bookmark-plus,mdi-bookmark-remove,mdi-border-all,mdi-border-bottom,
                mdi-border-color,mdi-border-horizontal,mdi-border-inside,mdi-border-left,mdi-border-none,mdi-border-outside,mdi-border-right,
                mdi-border-top,mdi-border-vertical,mdi-bowling,mdi-box,mdi-briefcase,mdi-briefcase-check,mdi-briefcase-download,mdi-briefcase-upload,
                mdi-brightness-1,mdi-brightness-2,mdi-brightness-3,mdi-brightness-4,mdi-brightness-5,mdi-brightness-6,mdi-brightness-7,mdi-brightness-auto,
                mdi-broom,mdi-brush,mdi-bug,mdi-bulletin-board,mdi-bullhorn,mdi-bus,mdi-cake,mdi-cake-variant,mdi-calculator,mdi-calendar,mdi-calendar-blank,
                mdi-calendar-check,mdi-calendar-clock,mdi-calendar-multiple,mdi-calendar-multiple-check,mdi-calendar-plus,mdi-calendar-remove,
                mdi-calendar-text,mdi-calendar-today,mdi-camcorder,mdi-camcorder-off,mdi-camera,
                mdi-camera-front,mdi-camera-front-variant,mdi-camera-iris,mdi-camera-party-mode,mdi-camera-rear,mdi-camera-rear-variant,
                mdi-camera-switch,mdi-camera-timer,mdi-candycane,mdi-car,mdi-car-wash,mdi-carrot,mdi-cart,mdi-cart-outline,mdi-cash,
                mdi-cash-100,mdi-cash-multiple,mdi-cash-usd,mdi-cast,mdi-cast-connected,mdi-castle,mdi-cat,mdi-cellphone,mdi-cellphone-android,
                mdi-cellphone-dock,mdi-cellphone-iphone,mdi-cellphone-link,mdi-cellphone-link-off,mdi-cellphone-settings,mdi-chair-school,
                mdi-chart-arc,mdi-chart-areaspline,mdi-chart-bar,mdi-chart-histogram,mdi-chart-line,mdi-chart-pie,mdi-check,mdi-check-all,
                mdi-checkbox-blank,mdi-checkbox-blank-circle,mdi-checkbox-blank-circle-outline,mdi-checkbox-blank-outline,mdi-checkbox-marked,
                mdi-checkbox-marked-circle,mdi-checkbox-marked-circle-outline,mdi-checkbox-marked-outline,mdi-checkbox-multiple-blank,
                mdi-checkbox-multiple-blank-outline,mdi-checkbox-multiple-marked,mdi-checkbox-multiple-marked-outline,mdi-checkerboard,
                mdi-chevron-double-down,mdi-chevron-double-left,mdi-chevron-double-right,mdi-chevron-double-up,mdi-chevron-down,mdi-chevron-left,
                mdi-chevron-right,mdi-chevron-up,mdi-church,mdi-cisco-webex,mdi-city,mdi-clipboard,mdi-clipboard-account,mdi-clipboard-alert,
                mdi-clipboard-arrow-down,mdi-clipboard-arrow-left,mdi-clipboard-check,mdi-clipboard-outline,mdi-clipboard-text,mdi-clippy,mdi-clock,
                mdi-clock-fast,mdi-close,mdi-close-box,mdi-close-box-outline,mdi-close-circle,mdi-close-circle-outline,mdi-close-network,
                mdi-closed-caption,mdi-cloud,mdi-cloud-check,mdi-cloud-circle,mdi-cloud-download,mdi-cloud-outline,mdi-cloud-outline-off,
                mdi-cloud-upload,mdi-code-array,mdi-code-braces,mdi-code-equal,mdi-code-greater-than,mdi-code-less-than,mdi-code-less-than-or-equal,
                mdi-code-not-equal,mdi-code-not-equal-variant,mdi-code-string,mdi-code-tags,mdi-codepen,mdi-coffee,mdi-coffee-to-go,
                mdi-color-helper,mdi-comment,mdi-comment-account,mdi-comment-account-outline,mdi-comment-alert,mdi-comment-alert-outline,
                mdi-comment-check,mdi-comment-check-outline,mdi-comment-multiple-outline,mdi-comment-outline,mdi-comment-plus-outline,
                mdi-comment-processing,mdi-comment-processing-outline,mdi-comment-remove-outline,mdi-comment-text,mdi-comment-text-outline,
                mdi-compare,mdi-compass,mdi-compass-outline,mdi-console,mdi-content-copy,mdi-content-cut,mdi-content-duplicate,mdi-content-paste,
                mdi-content-save,mdi-content-save-all,mdi-contrast,mdi-contrast-box,mdi-contrast-circle,mdi-cow,mdi-credit-card,mdi-credit-card-multiple,
                mdi-crop,mdi-crop-free,mdi-crop-landscape,mdi-crop-portrait,mdi-crop-square,mdi-crosshairs,mdi-crosshairs-gps,mdi-crown,mdi-cube,
                mdi-cube-outline,mdi-cube-unfolded,mdi-cup,mdi-cup-water,mdi-currency-btc,mdi-currency-eur,mdi-currency-gbp,mdi-currency-inr,mdi-currency-rub,
                mdi-currency-try,mdi-currency-usd,mdi-cursor-default,mdi-cursor-default-outline,mdi-cursor-move,mdi-cursor-pointer,mdi-database,mdi-database-minus,
                mdi-database-plus,mdi-debug-step-into,mdi-debug-step-out,mdi-debug-step-over,mdi-decimal-decrease,mdi-decimal-increase,
                mdi-delete,mdi-delete-variant,mdi-deskphone,mdi-desktop-mac,mdi-desktop-tower,mdi-details,mdi-deviantart,mdi-diamond,mdi-dice-1,
                mdi-dice-2,mdi-dice-3,mdi-dice-4,mdi-dice-5,mdi-dice-6,mdi-directions,mdi-disqus,mdi-division,
                mdi-division-box,mdi-dns,mdi-domain,mdi-dots-horizontal,mdi-dots-vertical,mdi-download,mdi-drag,mdi-drag-horizontal,mdi-drag-vertical,
                mdi-drawing,mdi-drawing-box,mdi-drone,mdi-dropbox,mdi-drupal,mdi-duck,mdi-dumbbell,mdi-earth,mdi-earth-off,
                mdi-eject,mdi-elevation-decline,mdi-elevation-rise,mdi-elevator,mdi-email,mdi-email-open,mdi-email-outline,mdi-emoticon,
                mdi-emoticon-cool,mdi-emoticon-devil,mdi-emoticon-happy,mdi-emoticon-neutral,mdi-emoticon-poop,mdi-emoticon-sad,mdi-emoticon-tongue,mdi-engine,
                mdi-engine-outline,mdi-equal,mdi-equal-box,mdi-eraser,mdi-escalator,mdi-evernote,mdi-exclamation,mdi-exit-to-app,mdi-export,mdi-eye,mdi-eye-off,
                mdi-eyedropper,mdi-eyedropper-variant,mdi-facebook,mdi-facebook-box,mdi-facebook-messenger,mdi-factory,mdi-fan,mdi-fast-forward,mdi-ferry,mdi-file,
                mdi-file-cloud,mdi-file-delimited,mdi-file-document,mdi-file-document-box,mdi-file-excel,mdi-file-excel-box,mdi-file-find,mdi-file-image,mdi-file-image-box,
                mdi-file-multiple,mdi-file-music,mdi-file-outline,mdi-file-pdf,mdi-file-pdf-box,mdi-file-powerpoint,mdi-file-powerpoint-box,mdi-file-presentation-box,
                mdi-file-video,mdi-file-word,mdi-file-word-box,mdi-file-xml,mdi-film,mdi-filmstrip,mdi-filmstrip-off,mdi-filter,mdi-filter-outline,mdi-filter-remove,
                mdi-filter-remove-outline,mdi-filter-variant,mdi-fire,mdi-firefox,mdi-fish,mdi-flag,mdi-flag-checkered,mdi-flag-outline,mdi-flag-outline-variant,
                mdi-flag-triangle,mdi-flag-variant,mdi-flash,mdi-flash-auto,mdi-flash-off,mdi-flashlight,mdi-flashlight-off,mdi-flattr,mdi-flip-to-back,mdi-flip-to-front,
                mdi-floppy,mdi-flower,mdi-folder,mdi-folder-account,mdi-folder-download,mdi-folder-google-drive,mdi-folder-image,mdi-folder-lock,mdi-folder-lock-open,
                mdi-folder-move,mdi-folder-multiple,mdi-folder-multiple-image,mdi-folder-multiple-outline,mdi-folder-outline,mdi-folder-plus,mdi-folder-remove,
                mdi-folder-upload,mdi-food,mdi-food-apple,mdi-food-variant,mdi-football,mdi-football-helmet,mdi-format-align-center,mdi-format-align-justify,
                mdi-format-align-left,mdi-format-align-right,mdi-format-bold,mdi-format-clear,mdi-format-color-fill,mdi-format-float-center,mdi-format-float-left,
                mdi-format-float-none,mdi-format-float-right,mdi-format-header-1,mdi-format-header-2,mdi-format-header-3,mdi-format-header-4,mdi-format-header-5,
                mdi-format-header-6,mdi-format-header-decrease,mdi-format-header-equal,mdi-format-header-increase,mdi-format-header-pound,mdi-format-indent-decrease,
                mdi-format-indent-increase,mdi-format-italic,mdi-format-line-spacing,mdi-format-list-bulleted,mdi-format-list-numbers,mdi-format-paint,mdi-format-paragraph,
                mdi-format-quote,mdi-format-size,mdi-format-strikethrough,mdi-format-subscript,mdi-format-superscript,mdi-format-text,mdi-format-textdirection-l-to-r,
                mdi-format-textdirection-r-to-l,mdi-format-underline,mdi-format-wrap-inline,mdi-format-wrap-square,mdi-format-wrap-tight,mdi-format-wrap-top-bottom,mdi-forum,
                mdi-forward,mdi-foursquare,mdi-fridge,mdi-fullscreen,mdi-fullscreen-exit,mdi-function,mdi-gamepad,mdi-gamepad-variant,mdi-gas-station,mdi-gavel,mdi-gender-female,
                mdi-gender-male,mdi-gender-male-female,mdi-gender-transgender,mdi-gift,mdi-git,mdi-github-box,mdi-github-circle,mdi-glass-flute,mdi-glass-mug,mdi-glass-stange,
                mdi-glass-tulip,mdi-glasses,mdi-gmail,mdi-google,mdi-google-chrome,mdi-google-circles,mdi-google-circles-communities,mdi-google-circles-extended,mdi-google-circles-group,
                mdi-google-controller,mdi-google-controller-off,mdi-google-drive,mdi-google-earth,mdi-google-glass,mdi-google-maps,mdi-google-pages,mdi-google-play,mdi-google-plus,
                mdi-google-plus-box,mdi-grid,mdi-grid-off,mdi-group,mdi-guitar,mdi-guitar-pick,mdi-guitar-pick-outline,mdi-hand-pointing-right,mdi-hanger,mdi-hangouts,mdi-harddisk,
                mdi-headphones,mdi-headphones-box,mdi-headphones-settings,mdi-headset,mdi-headset-dock,mdi-headset-off,mdi-heart,mdi-heart-box,mdi-heart-box-outline,mdi-heart-broken,
                mdi-heart-outline,mdi-help,mdi-help-circle,mdi-hexagon,mdi-hexagon-outline,mdi-history,mdi-hololens,mdi-home,mdi-home-modern,mdi-home-variant,mdi-hops,mdi-hospital,
                mdi-hospital-building,mdi-hospital-marker,mdi-hotel,mdi-houzz,mdi-houzz-box,mdi-human,mdi-human-child,mdi-human-male-female,mdi-image-album,mdi-image-area,
                mdi-image-area-close,mdi-image-broken,mdi-image-filter,mdi-image-filter-black-white,mdi-image-filter-center-focus,mdi-image-filter-drama,mdi-image-filter-frames,
                mdi-image-filter-hdr,mdi-image-filter-none,mdi-image-filter-tilt-shift,mdi-image-filter-vintage,mdi-import,mdi-inbox,mdi-information,mdi-information-outline,
                mdi-instagram,mdi-instapaper,mdi-internet-explorer,mdi-invert-colors,mdi-jira,mdi-jsfiddle,mdi-keg,mdi-key,mdi-key-change,mdi-key-minus,mdi-key-plus,mdi-key-remove,
                mdi-key-variant,mdi-keyboard,mdi-keyboard-backspace,mdi-keyboard-caps,mdi-keyboard-close,mdi-keyboard-off,mdi-keyboard-return,mdi-keyboard-tab,mdi-keyboard-variant,
                mdi-label,mdi-label-outline,mdi-language-csharp,mdi-language-css3,mdi-language-html5,mdi-language-javascript,mdi-language-python,mdi-language-python-text,mdi-laptop,
                mdi-laptop-chromebook,mdi-laptop-mac,mdi-laptop-windows,mdi-lastfm,mdi-launch,mdi-layers,mdi-layers-off,mdi-leaf,mdi-library,mdi-library-books,mdi-library-music,
                mdi-library-plus,mdi-lightbulb,mdi-lightbulb-outline,mdi-link,mdi-link-off,mdi-link-variant,mdi-link-variant-off,mdi-linkedin,mdi-linkedin-box,mdi-linux,mdi-lock,
                mdi-lock-open,mdi-lock-open-outline,mdi-lock-outline,mdi-login,mdi-logout,mdi-looks,mdi-loupe,mdi-lumx,mdi-magnet,mdi-magnet-on,mdi-magnify,mdi-magnify-minus,
                mdi-magnify-plus,mdi-mail-ru,mdi-map,mdi-map-marker,mdi-map-marker-circle,mdi-map-marker-multiple,mdi-map-marker-off,mdi-map-marker-radius,mdi-margin,mdi-markdown,
                mdi-marker-check,mdi-martini,mdi-material-ui,mdi-math-compass,mdi-maxcdn,mdi-medium,mdi-memory,mdi-menu,mdi-menu-down,mdi-menu-left,mdi-menu-right,mdi-menu-up,
                mdi-message,mdi-message-alert,mdi-message-draw,mdi-message-image,mdi-message-processing,mdi-message-reply,mdi-message-text,mdi-message-text-outline,mdi-message-video,
                mdi-microphone,mdi-microphone-off,mdi-microphone-outline,mdi-microphone-settings,mdi-microphone-variant,mdi-microphone-variant-off,mdi-minus,mdi-minus-box,
                mdi-minus-circle,mdi-minus-circle-outline,mdi-minus-network,mdi-monitor,mdi-monitor-multiple,mdi-more,mdi-motorbike,mdi-mouse,mdi-mouse-off,mdi-mouse-variant,
                mdi-mouse-variant-off,mdi-movie,mdi-multiplication,mdi-multiplication-box,mdi-music-box,mdi-music-box-outline,mdi-music-circle,mdi-music-note,mdi-music-note-eighth,
                mdi-music-note-half,mdi-music-note-off,mdi-music-note-quarter,mdi-music-note-sixteenth,mdi-music-note-whole,mdi-nature,mdi-nature-people,mdi-navigation,mdi-needle,
                mdi-nest-protect,mdi-nest-thermostat,mdi-newspaper,mdi-nfc,mdi-nfc-tap,mdi-nfc-variant,mdi-note,mdi-note-outline,mdi-note-text,mdi-numeric,mdi-numeric-0-box,
                mdi-numeric-0-box-multiple-outline,mdi-numeric-0-box-outline,mdi-numeric-1-box,mdi-numeric-1-box-multiple-outline,mdi-numeric-1-box-outline,mdi-numeric-2-box,
                mdi-numeric-2-box-multiple-outline,mdi-numeric-2-box-outline,mdi-numeric-3-box,mdi-numeric-3-box-multiple-outline,mdi-numeric-3-box-outline,mdi-numeric-4-box,
                mdi-numeric-4-box-multiple-outline,mdi-numeric-4-box-outline,mdi-numeric-5-box,mdi-numeric-5-box-multiple-outline,mdi-numeric-5-box-outline,mdi-numeric-6-box,
                mdi-numeric-6-box-multiple-outline,mdi-numeric-6-box-outline,mdi-numeric-7-box,mdi-numeric-7-box-multiple-outline,mdi-numeric-7-box-outline,mdi-numeric-8-box,
                mdi-numeric-8-box-multiple-outline,mdi-numeric-8-box-outline,mdi-numeric-9-box,mdi-numeric-9-box-multiple-outline,mdi-numeric-9-box-outline,mdi-numeric-9-plus-box,
                mdi-numeric-9-plus-box-multiple-outline,mdi-numeric-9-plus-box-outline,mdi-nutriton,mdi-odnoklassniki,mdi-office,mdi-oil,mdi-omega,mdi-onedrive,mdi-open-in-app,
                mdi-open-in-new,mdi-ornament,mdi-ornament-variant,mdi-outbox,mdi-owl,mdi-package,mdi-package-down,mdi-package-up,mdi-package-variant,mdi-package-variant-closed,
                mdi-palette,mdi-palette-advanced,mdi-panda,mdi-pandora,mdi-panorama,mdi-panorama-fisheye,mdi-panorama-horizontal,mdi-panorama-vertical,mdi-panorama-wide-angle,
                mdi-paper-cut-vertical,mdi-paperclip,mdi-parking,mdi-pause,mdi-pause-circle,mdi-pause-circle-outline,mdi-pause-octagon,mdi-pause-octagon-outline,mdi-paw,mdi-pen,
                mdi-pencil,mdi-pencil-box,mdi-pencil-box-outline,mdi-percent,mdi-pharmacy,mdi-phone,mdi-phone-bluetooth,mdi-phone-forward,mdi-phone-hangup,mdi-phone-in-talk,
                mdi-phone-incoming,mdi-phone-locked,mdi-phone-log,mdi-phone-missed,mdi-phone-outgoing,mdi-phone-paused,mdi-phone-settings,mdi-pig,mdi-pill,mdi-pin,mdi-pin-off,
                mdi-pine-tree,mdi-pine-tree-box,mdi-pinterest,mdi-pinterest-box,mdi-pizza,mdi-play,mdi-play-box-outline,mdi-play-circle,mdi-play-circle-outline,mdi-playlist-minus,
                mdi-playlist-plus,mdi-playstation,mdi-plus,mdi-plus-box,mdi-plus-circle,mdi-plus-circle-outline,mdi-plus-network,mdi-plus-one,mdi-pocket,mdi-poll,mdi-poll-box,
                mdi-polymer,mdi-popcorn,mdi-pound,mdi-pound-box,mdi-power,mdi-power-settings,mdi-power-socket,mdi-presentation,mdi-presentation-play,mdi-printer,mdi-printer-3d,
                mdi-pulse,mdi-puzzle,mdi-qrcode,mdi-quadcopter,mdi-quality-high,mdi-quicktime,mdi-radiator,mdi-radio,mdi-radio-tower,mdi-radioactive,mdi-radiobox-blank,
                mdi-radiobox-marked,mdi-raspberrypi,mdi-rdio,mdi-read,mdi-readability,mdi-receipt,mdi-recycle,mdi-redo,mdi-redo-variant,mdi-refresh,mdi-relative-scale,
                mdi-reload,mdi-remote,mdi-rename-box,mdi-repeat,mdi-repeat-off,mdi-repeat-once,mdi-replay,mdi-reply,mdi-reply-all,mdi-reproduction,mdi-resize-bottom-right,
                mdi-responsive,mdi-rewind,mdi-ribbon,mdi-road,mdi-rocket,mdi-rotate-3d,mdi-rotate-left,mdi-rotate-left-variant,mdi-rotate-right,mdi-rotate-right-variant,
                mdi-routes,mdi-rss,mdi-rss-box,mdi-ruler,mdi-run,mdi-sale,mdi-satellite,mdi-satellite-variant,mdi-scale,mdi-scale-bathroom,mdi-school,mdi-screen-rotation,
                mdi-screen-rotation-lock,mdi-script,mdi-sd,mdi-security,mdi-security-network,mdi-select,mdi-select-all,mdi-select-inverse,mdi-select-off,mdi-send,mdi-server,
                mdi-server-minus,mdi-server-network,mdi-server-network-off,mdi-server-off,mdi-server-plus,mdi-server-remove,mdi-server-security,mdi-settings,mdi-settings-box,
                mdi-shape-plus,mdi-share,mdi-share-variant,mdi-shield,mdi-shield-outline,mdi-shopping,mdi-shopping-music,mdi-shuffle,mdi-sigma,mdi-sign-caution,mdi-signal,
                mdi-silverware,mdi-silverware-fork,mdi-silverware-spoon,mdi-silverware-variant,mdi-sim-alert,mdi-sitemap,mdi-skip-next,mdi-skip-previous,mdi-skype,mdi-skype-business,
                mdi-sleep,mdi-sleep-off,mdi-smoking,mdi-smoking-off,mdi-snapchat,mdi-snowman,mdi-sofa,mdi-sort,mdi-sort-alphabetical,mdi-sort-ascending,mdi-sort-descending,
                mdi-sort-numeric,mdi-sort-variant,mdi-soundcloud,mdi-source-fork,mdi-source-pull,mdi-speaker,mdi-speaker-off,mdi-speedometer,mdi-spellcheck,mdi-spotify,
                mdi-spotlight,mdi-spotlight-beam,mdi-square-inc,mdi-square-inc-cash,mdi-stackoverflow,mdi-star,mdi-star-circle,mdi-star-half,mdi-star-outline,mdi-steam,
                mdi-stethoscope,mdi-stocking,mdi-stop,mdi-store,mdi-store-24-hour,mdi-stove,mdi-subway,mdi-sunglasses,mdi-swap-horizontal,mdi-swap-vertical,mdi-swim,
                mdi-sword,mdi-sync,mdi-sync-alert,mdi-sync-off,mdi-tab,mdi-tab-unselected,mdi-table,mdi-table-column-plus-after,mdi-table-column-plus-before,
                mdi-table-column-remove,mdi-table-column-width,mdi-table-edit,mdi-table-large,mdi-table-row-height,mdi-table-row-plus-after,mdi-table-row-plus-before,
                mdi-table-row-remove,mdi-tablet,mdi-tablet-android,mdi-tablet-ipad,mdi-tag,mdi-tag-faces,mdi-tag-multiple,mdi-tag-outline,mdi-tag-text-outline,mdi-taxi,
                mdi-teamviewer,mdi-telegram,mdi-television,mdi-television-guide,mdi-temperature-celsius,mdi-temperature-fahrenheit,mdi-temperature-kelvin,mdi-tennis,mdi-tent,
                mdi-terrain,mdi-text-to-speech,mdi-text-to-speech-off,mdi-texture,mdi-theater,mdi-theme-light-dark,mdi-thermometer,mdi-thermometer-lines,mdi-thumb-down,
                mdi-thumb-down-outline,mdi-thumb-up,mdi-thumb-up-outline,mdi-thumbs-up-down,mdi-ticket,mdi-ticket-account,mdi-tie,mdi-timelapse,mdi-timer,mdi-timer-10,
                mdi-timer-3,mdi-timer-off,mdi-timer-sand,mdi-timetable,mdi-toggle-switch,mdi-toggle-switch-off,mdi-tooltip,mdi-tooltip-edit,mdi-tooltip-image,mdi-tooltip-outline,
                mdi-tooltip-outline-plus,mdi-tooltip-text,mdi-tor,mdi-traffic-light,mdi-train,mdi-tram,mdi-transcribe,mdi-transcribe-close,mdi-transfer,mdi-tree,mdi-trello,
                mdi-trending-down,mdi-trending-neutral,mdi-trending-up,mdi-trophy,mdi-trophy-award,mdi-trophy-variant,mdi-truck,mdi-tshirt-crew,mdi-tshirt-v,mdi-tumblr,
                mdi-tumblr-reblog,mdi-twitch,mdi-twitter,mdi-twitter-box,mdi-twitter-circle,mdi-twitter-retweet,mdi-ubuntu,mdi-umbrella,mdi-umbrella-outline,mdi-undo,
                mdi-undo-variant,mdi-unfold-less,mdi-unfold-more,mdi-ungroup,mdi-untappd,mdi-upload,mdi-usb,mdi-vector-curve,mdi-vector-point,mdi-vector-square,mdi-verified,
                mdi-vibrate,mdi-video,mdi-video-off,mdi-video-switch,mdi-view-agenda,mdi-view-array,mdi-view-carousel,mdi-view-column,mdi-view-dashboard,mdi-view-day,mdi-view-grid,
                mdi-view-headline,mdi-view-list,mdi-view-module,mdi-view-quilt,mdi-view-stream,mdi-view-week,mdi-vimeo,mdi-vine,mdi-vk,mdi-vk-box,mdi-vk-circle,mdi-voicemail,
                mdi-volume-high,mdi-volume-low,mdi-volume-medium,mdi-volume-off,mdi-vpn,mdi-walk,mdi-wallet,mdi-wallet-giftcard,mdi-wallet-membership,mdi-wallet-travel,mdi-watch,
                mdi-watch-export,mdi-watch-import,mdi-water,mdi-water-off,mdi-water-pump,mdi-weather-cloudy,mdi-weather-fog,mdi-weather-hail,mdi-weather-lightning,mdi-weather-night,
                mdi-weather-partlycloudy,mdi-weather-pouring,mdi-weather-rainy,mdi-weather-snowy,mdi-weather-sunny,mdi-weather-sunset,mdi-weather-sunset-down,mdi-weather-sunset-up,
                mdi-weather-windy,mdi-weather-windy-variant,mdi-web,mdi-webcam,mdi-weight,mdi-weight-kilogram,mdi-whatsapp,mdi-wheelchair-accessibility,mdi-white-balance-auto,
                mdi-white-balance-incandescent,mdi-white-balance-irradescent,mdi-white-balance-sunny,mdi-wifi,mdi-wii,mdi-wikipedia,mdi-window-close,mdi-window-closed,
                mdi-window-maximize,mdi-window-open,mdi-window-restore,mdi-windows,mdi-wordpress,mdi-worker,mdi-xbox,mdi-xbox-controller,
                mdi-xbox-controller-off,mdi-xda,mdi-xml,mdi-yeast,mdi-yelp,mdi-youtube-play,mdi-zip-box,mdi-format-title,mdi-priority-high,mdi-select-group,mdi-script-text-outline`,
            listIconToShow: [],
            tab: null,
            items: [
                this.$t('iconPicker.tabs.icon'),
                this.$t('iconPicker.tabs.url'),
                this.$t('iconPicker.tabs.upload'),
            ],
            type: 'icon',
            searchIconKeyword: null,
            link: null,
            isShow: this.alwaysShow,
            context: '',
        };
    },
    mounted() {
        this.listIconToShow = this.listIcon.split(',').slice(0, 150);
        this.link = this.defaultIcon;
    },
    methods: {
        reset() {
            this.listIconToShow = this.listIcon.split(',').slice(0, 150);
            this.searchIconKeyword = '';
            this.$refs.fileUpload && this.$refs.fileUpload.reset();
        },
        searchIcon() {
            let listIcons = this.listIcon.split(',');
            if (!!this.searchIconKeyword) {
                let str = this.searchIconKeyword.trim().toLocaleLowerCase();
                let count = 0;
                this.listIconToShow = [];
                for (const icon of listIcons) {
                    if (icon.includes(str)) {
                        this.listIconToShow.push(icon);
                        if (count++ > 150) {
                            break;
                        }
                    }
                }
            } else {
                this.listIconToShow = listIcons.slice(0, 150);
            }
        },
        selectImage(image) {
            this.type = 'image';
            this.selectIcon(image);
        },
        selectIcon(icon) {
            this.$emit('selected', icon.trim());
        },
        setContext(ctx) {
            this.context = ctx;
        },
        getContext() {
            return this.context;
        },
        show(position) {
            this.isShow = true;
            if (this.float) {
                $('.card-icon-material').css({
                    position: 'absolute',
                    'max-width': this.maxWidth + 'px',
                    'max-height': this.maxHeight + 'px',
                    'z-index': '9999',
                    top: position.top,
                    left: position.left,
                    'box-shadow': '0px 3px 6px #00000029',
                });
            }
        },
        hide() {
            this.isShow = false;
            this.context = '';
        },
    },
};
</script>
<style scoped>
.pick-icon >>> .v-menu__content {
    overflow: hidden;
}
.sym-small-size >>> .v-input__slot,
.sym-small-size >>> .v-input__control {
    background: #f5f5f5 !important;
}
.single-icon {
    cursor: pointer;
}
.single-icon:hover {
    background-color: #f5f5f5;
}
.v-menu__content {
    background: #fff;
    overflow: hidden;
}
.tab-item {
    height: 300px;
    overflow-y: auto;
}
</style>
