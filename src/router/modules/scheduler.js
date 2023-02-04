export default [
    {
        path: "/scheduler",
        name: "scheduler",
        component: () =>
            import('../../views/scheduler/BaConfig/SchedulerList.vue'),
    },
    {
        path: "/scheduler/config",
        name: "scheduler config",
        component: () =>
            import('../../views/scheduler/BaConfig/SchedulerConfig.vue'),
    },
    {
        path: "/scheduler/:id/edit",
        name: "editScheduler",
        component: () =>
            import('../../views/scheduler/BaConfig/EditScheduler.vue'),
    },
    {
        path: "/scheduler/:id/view",
        name: "viewScheduler",
        component: () =>
            import('../../views/scheduler/BaConfig/ViewScheduler.vue'),
    },
    {
        path: "/scheduler/view_enduser",
        name: "view_enduser",
        component: () =>
            import('../../views/scheduler/Scheduler_App.vue')
    },
];