import { SYMPER_APP } from '@/main.js';
export const GanttConfigHelper = {
    ganttLayout: {
        css: 'gantt_container',
        cols: [
            {
                width: 400,
                min_width: 100,
                rows: [
                    {
                        view: 'grid',
                        scrollX: 'gridScroll',
                        scrollable: true,
                        scrollY: 'scrollVer',
                    },
                    {
                        view: 'scrollbar',
                        id: 'gridScroll',
                        group: 'horizontal',
                    },
                ],
            },
            { resizer: true, width: 1 },
            {
                rows: [
                    {
                        view: 'timeline',
                        scrollX: 'scrollHor',
                        scrollY: 'scrollVer',
                    },
                    {
                        view: 'scrollbar',
                        id: 'scrollHor',
                        group: 'horizontal',
                    },
                ],
            },
            { view: 'scrollbar', id: 'scrollVer' },
        ],
    },
    shouldHighlightResource: function (resource) {
        var selectedTaskId = gantt.getState().selected_task;
        if (gantt.isTaskExists(selectedTaskId)) {
            var selectedTask = gantt.getTask(selectedTaskId),
                selectedResource = selectedTask[gantt.config.resource_property];

            if (resource.id == selectedResource) {
                return true;
            } else if (
                gantt.$resourcesStore.isChildOf(selectedResource, resource.id)
            ) {
                return true;
            }
        }
        return false;
    },
    createBox(sizes, class_name) {
        var box = document.createElement('div');
        box.style.cssText = [
            'height:' + sizes.height + 'px',
            'line-height:' + sizes.height + 'px',
            'width:' + sizes.width + 'px',
            'top:' + sizes.top + 'px',
            'left:' + sizes.left + 'px',
            'position:absolute',
        ].join(';');
        box.className = class_name;
        return box;
    },
    zoomConfig(gantt) {
        return {
            levels: [
                // minute
                {
                    name: 'minute',
                    scale_height: 60,
                    scales: [
                        { unit: 'day', step: 1, format: '%d %M' },
                        { unit: 'hour', step: 1, format: '%H' },
                        { unit: 'minute', step: 15, format: '%i' },
                    ],
                },
                // hours
                {
                    name: 'hour',
                    scale_height: 60,
                    scales: [
                        { unit: 'day', step: 1, format: '%d %M' },
                        { unit: 'hour', step: 1, format: '%H' },
                    ],
                },
                // days
                {
                    name: 'day',
                    scale_height: 60,
                    scales: [
                        { unit: 'month', step: 1, format: '%M' },
                        { unit: 'day', step: 1, format: '%d' },
                    ],
                },
                // weeks
                {
                    name: 'week',
                    scale_height: 60,
                    scales: [
                        { unit: 'month', step: 1, format: '%M' },
                        {
                            unit: 'week',
                            step: 1,
                            format: function (date) {
                                var dateToStr = gantt.date.date_to_str('%d %M');
                                var endDate = gantt.date.add(date, -6, 'day');
                                var weekNum =
                                    gantt.date.date_to_str('%W')(date);
                                return (
                                    '#' +
                                    weekNum +
                                    ', ' +
                                    dateToStr(date) +
                                    ' - ' +
                                    dateToStr(endDate)
                                );
                            },
                        },
                    ],
                },
                {
                    name: 'month',
                    height: 60,
                    scales: [
                        {
                            unit: 'month',
                            step: 3,
                            format: function (date) {
                                var dateToStr = gantt.date.date_to_str('%M %y');
                                var endDate = gantt.date.add(
                                    gantt.date.add(date, 3, 'month'),
                                    -1,
                                    'day',
                                );
                                return (
                                    dateToStr(date) + ' - ' + dateToStr(endDate)
                                );
                            },
                        },
                        { unit: 'month', step: 1, format: '%M' },
                    ],
                },
                // years
                {
                    name: 'year',
                    scale_height: 60,
                    scales: [
                        {
                            unit: 'year',
                            step: 5,
                            format: function (date) {
                                var dateToStr = gantt.date.date_to_str('%Y');
                                var endDate = gantt.date.add(
                                    gantt.date.add(date, 5, 'year'),
                                    -1,
                                    'day',
                                );
                                return (
                                    dateToStr(date) + ' - ' + dateToStr(endDate)
                                );
                            },
                        },
                    ],
                },
            ],
            element: function () {
                return gantt.$root.querySelector('.gantt_task');
            },
        };
    },

    layoutWithRightColumns: function (secondGridColumns) {
        return {
            css: 'gantt_container',
            cols: [
                {
                    width: 400,
                    min_width: 300,
                    rows: [
                        {
                            view: 'grid',
                            scrollX: 'gridScroll',
                            scrollable: true,
                            scrollY: 'scrollVer',
                        },
                        {
                            view: 'scrollbar',
                            id: 'gridScroll',
                            group: 'horizontal',
                        },
                    ],
                },
                { resizer: true, width: 1 },
                {
                    rows: [
                        {
                            view: 'timeline',
                            scrollX: 'scrollHor',
                            scrollY: 'scrollVer',
                        },
                        {
                            view: 'scrollbar',
                            id: 'scrollHor',
                            group: 'horizontal',
                        },
                    ],
                },
                { resizer: true, width: 1 },
                {
                    view: 'grid',
                    width: 140,
                    bind: 'task',
                    scrollY: 'scrollVer',
                    scrollX: 'scrollHor',
                    config: secondGridColumns,
                },
                { view: 'scrollbar', id: 'scrollVer' },
            ],
        };
    },
    applyConfig: function (config, dates, gantt) {
        gantt.config.scales = config.scales;
        var lowest_scale = config.scales.reverse()[0];

        if (dates && dates.start_date && dates.end_date) {
            gantt.config.start_date = gantt.date.add(
                dates.start_date,
                -1,
                lowest_scale.unit,
            );
            gantt.config.end_date = gantt.date.add(
                gantt.date[lowest_scale.unit + '_start'](dates.end_date),
                2,
                lowest_scale.unit,
            );
        } else {
            gantt.config.start_date = gantt.config.end_date = null;
        }
        if (config.scroll_position) {
            setTimeout(function () {
                gantt.scrollTo(
                    config.scroll_position.x,
                    config.scroll_position.y,
                );
            }, 4);
        }
    },
    getUnitsBetween: function (from, to, unit, step, gantt) {
        var start = new Date(from),
            end = new Date(to);
        var units = 0;
        while (start.valueOf() < end.valueOf()) {
            units++;
            start = gantt.date.add(start, step, unit);
        }
        return units;
    },
    zoomToFit: function (gantt) {
        var project = gantt.getSubtaskDates(),
            areaWidth = gantt.$task.offsetWidth,
            scaleConfigs = GanttConfigHelper.zoomConfig(gantt).levels;

        for (var i = 0; i < scaleConfigs.length; i++) {
            var columnCount = this.getUnitsBetween(
                project.start_date,
                project.end_date,
                scaleConfigs[i].scales[scaleConfigs[i].scales.length - 1].unit,
                scaleConfigs[i].scales[0].step,
                gantt,
            );
            if (
                (columnCount + 2) * gantt.config.min_column_width <=
                areaWidth
            ) {
                break;
            }
        }
        if (i == scaleConfigs.length) {
            i--;
        }
        gantt.config.scale_height = 20 * 3;
        gantt.ext.zoom.setLevel(scaleConfigs[i].name);
        GanttConfigHelper.applyConfig(scaleConfigs[i], project, gantt);
    },
    addElement(config) {
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.className = config.css || '';
        div.style.left = config.left;
        div.style.width = config.width;
        div.style.height = config.height;
        div.style.lineHeight = config.height;
        div.style.top = config.top;
        if (config.html) div.innerHTML = config.html;
        if (config.wrapper) config.wrapper.appendChild(div);
        return div;
    },
    getDefaultConfig() {
        return {
            config: {
                drag_project: true,
                min_column_width: 30,
                scale_height: 20 * 3,
                auto_types: true,
                duration_step: 1,
                show_errors: false,
                duration_unit: 'minute',
                tooltip_hide_timeout: 1000,
                open_split_tasks: true,
                open_tree_initially: true,
                drag_multiple: true,
                sort: true,
                grid_resize: true,
                date_format: '%Y-%m-%d %H:%i:%s',
                scale_height: 20 * 3,
                work_time: true,
                readonly: true,
                show_drag_vertical: true,
                show_drag_dates: true,
                drag_label_width: 70,
                drag_date: '%Y‐%m‐%d',
                undo_steps: 200,
                open_split_tasks: true,
            },
            templates: {
                progress_text: function (start, end, task) {
                    return (
                        "<span style='text-align:left,'>" +
                        Math.round(task.progress * 100) +
                        '% </span>'
                    );
                },
                rightside_text: function (start, end, task) {
                    return task.rightOutterContent;
                },
                leftside_text: function (start, end, task) {
                    return task.leftOutterContent;
                },
                tooltip_text: function (start, end, task) {
                    let arr = [
                        `<b>${SYMPER_APP.$t('common.name')}:</b> ${task.text}`,
                        `<b>${SYMPER_APP.$t('common.startDay')}:</b> ${start
                            .toString()
                            .substring(0, 25)}`,
                        `<b>${SYMPER_APP.$t('common.endDay')}:</b> ${end
                            .toString()
                            .substring(0, 25)}`,
                    ];
                    if (task.tooltips) {
                        for (let i in task.tooltips) {
                            let str = `<b>${i}:</b> ${task.tooltips[i]}`;
                            arr.push(str);
                        }
                    }
                    return arr.join('<br/>');
                },
                drag_date: null,
            },
        };
    },
    changeSkin(name) {
        var link = document.createElement('link');
        link.onload = function () {
            gantt.resetSkin();
            gantt.render();
        };
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.id = 'skin';
        let href = '/css/dhtmlx/skins/dhtmlxgantt_' + name + '.css';
        if (document.querySelector('#skin')) {
            document.querySelector('#skin').setAttribute('href', href);
        } else {
            link.href = href;
            document.head.appendChild(link);
        }
    },
    configGanttBaseline: function (gantt) {
        gantt.config.task_height = 14;
        gantt.config.bar_height = 14;
        gantt.attachEvent('onGanttReady', function () {
            gantt.addTaskLayer({
                renderer: {
                    render: function draw_planned(task) {
                        if (task.planned_start && task.planned_end) {
                            var sizes = gantt.getTaskPosition(
                                task,
                                task.planned_start,
                                task.planned_end,
                            );
                            var el = document.createElement('div');
                            el.className = 'symper-baseline';
                            el.style.left = sizes.left + 'px';
                            el.style.width = sizes.width + 'px';
                            el.style.top =
                                sizes.top + gantt.config.bar_height + 13 + 'px';
                            return el;
                        }
                        return false;
                    },
                    getRectangle: function (task, view) {
                        if (task.planned_start && task.planned_end) {
                            return gantt.getTaskPosition(
                                task,
                                task.planned_start,
                                task.planned_end,
                            );
                        }
                        return null;
                    },
                },
            });
        });
    },
};
