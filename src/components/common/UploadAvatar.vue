<template>
    <div>
        <v-btn icon @click="onButtonClick">
            <v-icon>mdi-attachment</v-icon>
            <input
                ref="uploader"
                class="d-none"
                type="file"
                @change="onFileChanged"
            />
        </v-btn>
        <button @click="getResult">
            {{ $t('v2.general.clipImage') }}
        </button>
        <clipper-basic
            class="my-clipper"
            ref="clipper"
            :src="test"
            preview="my-preview"
        >
            <div class="placeholder" slot="placeholder">
                {{ $t('v2.general.noImage') }}
            </div>
        </clipper-basic>
        <!-- <div>
            <div>preview:</div>
            <clipper-preview name="my-preview" class="my-clipper">
                <div class="placeholder" slot="placeholder">preview area</div>
            </clipper-preview>
        </div> -->
        <div>
            <div>result:</div>
            <img class="result" :src="resultURL" alt="" />
        </div>
        <button @click="upload">{{ $t('v2.general.uploadFile') }}</button>
    </div>
</template>

<script>
import VueRx from 'vue-rx';
import VuejsClipper from 'vuejs-clipper';
import { clipperBasic, clipperPreview, clipperUpload } from 'vuejs-clipper';
export default {
    components: {
        clipperBasic,
        clipperPreview,
        clipperUpload
    },
    data: function () {
        return {
            test: '',
            resultURL: '',
            formDatas: {}
        };
    },
    methods: {
        getResult: function () {
            const canvas = this.$refs.clipper.clip(); //call component's clip method
            this.resultURL = canvas.toDataURL('image/jpeg', 1); //canvas->image
        },
        upload() {
        },
        onButtonClick() {
            this.$refs.uploader.click();
        },
        onFileChanged(e) {
            this.selectedFile = e.target.files[0];
            let formData = new FormData();
            formData.append('file', this.selectedFile);
            this.formDatas = formData;
            this.test = window.URL.createObjectURL(e.target.files[0]);
        }
    }
};
</script>

<style></style>
