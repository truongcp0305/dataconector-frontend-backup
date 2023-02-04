<template>
    <div class="w-100 text-center">
        <label
            for="sym-upload-input"
            id="upload-segment"
            :style="{ 'background-image': 'url(' + img + ')' }"
        >
            <v-icon v-if="!!!img" class="display-2 pickFileIcon"
                >mdi-file-image</v-icon
            >
            <input
                type="file"
                ref="image"
                class="d-none"
                @change.prevent="changeFile"
                id="sym-upload-input"
                accept="image/*"
            />
        </label>
        <v-btn
            small
            color="primary"
            class="mb-3"
            :disabled="!!!img"
            @click.prevent="selectIcon"
        >
            {{ $t('iconPicker.selectImage') }}
        </v-btn>
    </div>
</template>

<script>
export default {
    name: 'Upload',
    props: {
        maxHeight: {
            type: Number,
            default: 100,
        },
        maxWidth: {
            type: Number,
            default: 100,
        },
    },
    data: function () {
        return {
            img: '',
        };
    },
    methods: {
        reset() {
            this.img = '';
            this.$refs.image.value = '';
        },
        selectIcon() {
            // Upload go here
            this.$emit('selectFile', this.img);
        },
        changeFile(evt) {
            let file = evt.target.files[0];
            if (file.type.match(/image.*/)) {
                let tgt = evt.target || window.event.srcElement,
                    self = this;
                if (FileReader) {
                    let fr = new FileReader();
                    fr.onload = function (readerEvent) {
                        let image = new Image();
                        image.onload = function (imageEvent) {
                            // Resize the image
                            let canvas = document.createElement('canvas'),
                                maxWidth = self.maxWidth,
                                maxHeight = self.maxHeight,
                                width = image.width,
                                height = image.height;
                            if (width > height) {
                                if (width > maxWidth) {
                                    height *= maxWidth / width;
                                    width = maxWidth;
                                }
                            } else {
                                if (height > maxHeight) {
                                    width *= maxHeight / height;
                                    height = maxHeight;
                                }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            canvas
                                .getContext('2d')
                                .drawImage(image, 0, 0, width, height);
                            let dataUrl = canvas.toDataURL(file.type);
                            let resizedImage = self.dataURLToBlob(dataUrl);
                            self.img = dataUrl;
                        };
                        image.src = readerEvent.target.result;
                    };
                    fr.readAsDataURL(file);
                }
            }
        },
        dataURLToBlob(dataURL) {
            let BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
                let parts = dataURL.split(',');
                let contentType = parts[0].split(':')[1];
                let raw = parts[1];
                return new Blob([raw], { type: contentType });
            }
            let parts = dataURL.split(BASE64_MARKER);
            let contentType = parts[0].split(':')[1];
            let raw = window.atob(parts[1]);
            let rawLength = raw.length;
            let uInt8Array = new Uint8Array(rawLength);
            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], { type: contentType });
        },
    },
};
</script>

<style scoped>
#upload-segment {
    width: 100px;
    height: 100px;
    background: #f5f5f5;
    display: block;
    border-radius: 2px;
    margin: 20px auto;
    text-align: center;
    cursor: pointer;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
}
.pickFileIcon {
    margin-top: 25px;
    color: #ccc;
}
</style>
