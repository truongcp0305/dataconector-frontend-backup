<template>
    <v-card
        id="list-control-autocomplete"
        class="list-control-autocomplete"
        style="display: none"
    >
        <input
            v-on:input="onSearch($event)"
            v-on:keydown="addControl($event)"
            v-on:keyup="handleKeyUp"
            v-on:focus="handleFocus"
            :placeholder="$t('v2.doc.search')"
            class="tf-search-control fs-13"
            type="text"
        />
        <v-divider></v-divider>
        <v-list>
            <control
                v-for="control in listControl"
                :key="control"
                :type="control"
                @click-item="selectControl"
            />
        </v-list>
    </v-card>
</template>
<script>
import Control from './../items/Control.vue';
export default {
    components: {
        control: Control,
    },
    data() {
        return {
            listControl: [
                'label',
                'image',
                'qrCode',
                'textInput',
                'richText',
                'number',
                'date',
                'time',
                'select',
                'radio',
                'checkbox',
                'percent',
                'user',
                'inputFilter',
                'table',
                'panel',
                'fileUpload',
                'approvalHistory',
                'submit',
            ],
        };
    },
    mounted() {
        $.expr[':'].Contains = jQuery.expr.createPseudo(function (arg) {
            return function (elem) {
                return (
                    jQuery(elem)
                        .text()
                        .toUpperCase()
                        .indexOf(arg.toUpperCase()) >= 0
                );
            };
        });
    },

    methods: {
        handleKeyUp(event) {
            if (event.keyCode == 38) {
                //up
                let index = $(
                    '#list-control-autocomplete .first-active',
                ).index();
                if (index > 0)
                    $('#list-control-autocomplete .first-active')
                        .removeClass('first-active')
                        .prevAll('.sym-control')
                        .not('.d-none')
                        .first()
                        .addClass('first-active');
            }
            if (event.keyCode == 40) {
                //down
                let index = $(
                    '#list-control-autocomplete .first-active',
                ).index();
                if (
                    index <
                    $('#list-control-autocomplete .sym-control').length - 1
                )
                    $('#list-control-autocomplete .first-active')
                        .removeClass('first-active')
                        .nextAll('.sym-control')
                        .not('.d-none')
                        .first()
                        .addClass('first-active');
            }
            $('#list-control-autocomplete').scrollTop(0); //set to top
            // $("#list-control-autocomplete").scrollTop($('#list-control-autocomplete .first-active').offset().top - $("#list-control-autocomplete").height());//th
        },
        handleFocus(e) {
            $('#list-control-autocomplete .sym-control').removeClass(
                'first-active',
            );
            $('#list-control-autocomplete .sym-control')
                .first()
                .addClass('first-active');
        },
        onSearch(event) {
            let val = $(event.target).val();
            $('#list-control-autocomplete .sym-control').removeClass('d-none');
            $('#list-control-autocomplete .sym-control').removeClass(
                'first-active',
            );
            $(
                '#list-control-autocomplete .sym-control:not(:Contains("' +
                    val +
                    '"))',
            ).addClass('d-none');
            $('#list-control-autocomplete .sym-control:Contains("' + val + '")')
                .first()
                .addClass('first-active');
        },
        addControl(event) {
            if (event.keyCode == 13) {
                let type = $(
                    '#list-control-autocomplete .first-active .control-content',
                ).attr('control-type');
                $('.tf-search-control').val('');
                $('#list-control-autocomplete .sym-control').removeClass(
                    'd-none',
                );
                $('#list-control-autocomplete .sym-control').removeClass(
                    'first-active',
                );
                this.$emit('add-control', type);
            }
        },
        selectControl(type) {
            $('.tf-search-control').val('');
            $('#list-control-autocomplete .sym-control').removeClass('d-none');
            $('#list-control-autocomplete .sym-control').removeClass(
                'first-active',
            );
            this.$emit('add-control', type);
        },
    },
};
</script>
<style scoped>
#list-control-autocomplete {
    position: absolute;
}
#list-control-autocomplete .v-list {
    max-height: 400px;
    overflow: auto;
}
.first-active {
    background: #f2f2f2;
}
.tf-search-control {
    margin: 8px 4px;
    padding: 0 8px;
    height: 25px;
    border-radius: 3px;
    background: #fafafa;
}
.tf-search-control:focus {
    outline: none;
}
</style>
