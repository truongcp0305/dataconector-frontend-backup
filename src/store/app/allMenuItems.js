export default {
    my_application: {
        title: 'myApplication',
        icon: 'mdi-briefcase-edit-outline',
        link: '/my-applications',
        group: 'My work'
    },
    workflow_definition: {
        title: 'workflows',
        icon: 'mdi-lan',
        group: 'My work',
        children: {
            listWorkflow: {
                title: 'listWorkflows',
                action: {
                    module: 'workflow',
                    resource: 'workflow_definition',
                    scope: 'workflow',
                    action: 'list'
                }
            },
            listTrash: {
                title: 'list-trash-workflow',
                link: '/workflow/trash'
            }
        }
    },
    document_definition: {
        title: 'documents',
        icon: 'mdi-file-document-edit-outline',
        group: 'My work',
        children: {
            listDocument: {
                title: 'listDocuments',
                action: {
                    module: 'document',
                    resource: 'document_definition',
                    scope: 'document',
                    action: 'list'
                }
            },
            listTrash: {
                title: 'listTrashDocuments',
                link: '/documents/trash'
            }
        }
    },
    BI: {
        title: 'Report',
        icon: 'mdi-view-dashboard-outline',
        group: 'My work',
        children: {
            dashboard: {
                title: 'dashboard',
                link: '/list-dashboard',
                icon: 'mdi-view-dashboard-outline'
            },
            listDashboard: {
                title: 'list-dashboard',
                link: '/list-dashboard',
                children: true
            },
            listTrashDashboard: {
                title: 'list-trash-dashboard',
                link: '/dashboards/trash',
                children: true
            },
            dataflow: {
                title: 'dataflow',
                icon: 'mdi-database-arrow-right-outline',
                link: '/dataflows'
            },
            listDataflow: {
                title: 'list-dataflow',
                link: '/dataflows',
                children: true
            },
            listTrashDataflow: {
                title: 'list-trash-dataflow',
                link: '/dataflows/trash',
                children: true
            },
            relation: {
                title: 'relation',
                icon: 'mdi-relation-zero-or-many-to-zero-or-one',
                link: '/relations'
            },
            listRelation: {
                title: 'list-relation',
                link: '/relations',
                children: true
            },
            listTrashRelation: {
                title: 'list-trash-relation',
                link: '/relations/trash',
                children: true
            },
            dataset: {
                title: 'dataset',
                icon: 'mdi-view-module-outline',
                link: '/datasets'
            },
            listDataset: {
                title: 'list-dataset',
                link: '/datasets',
                children: true
            },
            listTrashDataset: {
                title: 'list-trash-dataset',
                link: '/datasets/trash',
                children: true
            }
        }
    },
    orgchart: {
        title: 'orgchart',
        icon: 'mdi-office-building-outline',
        group: 'My work',
        children: {
            list: {
                title: 'listOrgchart',
                link: '/orgchart'
            },
            trash: {
                title: 'listTrashOrgchart',
                link: '/orgchart/trash'
            },
            viewOrgchart: {
                title: 'viewOrgchart'
                // link: "/orgchart/:id/view"
            }
        }
    },
    myItem: {
        title: 'myItem',
        icon: 'mdi-format-list-checkbox',
        link: '/myitem',
        group: 'My work'
    },
    viewManagement: {
        icon: 'mdi-archive-eye-outline',
        title: 'view-management',
        group: 'Applications',
        children: {
            kanban: {
                title: 'Kanban',
                link: '/kanban'
            },
            scheduler: {
                title: 'Scheduler',
                link: '/scheduler'
            }
        }
    },
    smartObject: {
        icon: 'mdi-file-link-outline',
        title: 'smart-object',
        group: 'Applications',
        children: {
            list: {
                title: 'listSmartObject',
                link: '/smart-object'
            },
            trash: {
                title: 'listTrashSmartObject',
                link: '/smart-object/trash'
            }
        }
    },
    tenantManagement: {
        icon: 'mdi-database-cog-outline',
        title: 'tenant-management',
        group: 'Applications',
        children: {
            list: {
                title: 'listTenant',
                link: '/tenant-management'
            },
            trash: {
                title: 'listTrashTenant',
                link: '/tenant-management/trash'
            }
        }
    },
    userManager: {
        title: 'Account management',
        icon: 'mdi-account-cog-outline',
        group: 'Administrator',
        children: {
            account: {
                title: 'users',
                icon: 'mdi-account-settings',
                link: '/users'
            },
            account_trash: {
                title: 'account_trash',
                icon: 'mdi-account-settings',
                link: '/users/trash'
            },
            ba_account: {
                title: 'baAccount',
                icon: 'mdi-account-tie',
                link: '/ba-account'
            }
        }
    },
    access_control: {
        title: 'accessControl',
        icon: 'mdi mdi-shield-key-outline',
        group: 'Administrator',
        children: {
            filter: {
                title: 'filter',
                icon: 'mdi-filter-outline',
                link: '/access-control/filter'
            },
            actionPack: {
                title: 'actionPack',
                icon: 'mdi-tune',
                link: '/access-control/action-pack'
            },
            permission: {
                title: 'permission',
                icon: 'mdi-shield-account-variant-outline',
                link: '/access-control/permission'
            },
            systemRole: {
                title: 'systemRole',
                icon: 'mdi-account-circle-outline',
                link: '/access-control/system-role'
            },
            orgchartRole: {
                title: 'orgchartRole',
                icon: 'mdi-account-circle-outline',
                link: '/access-control/orgchart-role'
            }
        }
    },
    syql_function: {
        title: 'syqlFunction',
        icon: 'mdi mdi-function-variant',
        group: 'Administrator',
        link: '/syql-manager'
    },
    application_definition: {
        title: 'apps',
        icon: 'mdi mdi-widgets-outline',
        group: 'My work',
        children: {
            listApp: {
                title: 'listApps',
                icon: 'mdi-folder-account',
                link: '/apps'
            },
            listTrashApp: {
                title: 'listTrashApps',
                icon: 'mdi-access-point-network',
                link: '/apps/trash'
            }
        }
    },
    settingNotication: {
        title: 'Notification',
        icon: 'mdi-bell-check-outline',
        group: 'Setting',
        children: {
            settingNotificationUser: {
                title: 'notification_user',
                icon: 'mdi-folder-account',
                link: '/setting-notification'
            },
            settingNoticationBa: {
                icon: 'mdi-bell-plus-outline',
                title: 'notification_config_ba',
                icon: 'mdi-access-point-network',
                link: '/setting-notification-Ba'
            }
        }
    },
    environmentManagement: {
        title: 'environment',
        icon: 'mdi-earth',
        group: 'Setting',
        link: '/environment-management'
    },
    authen: {
        title: 'Authen',
        icon: 'mdi-account-key',
        link: '/authen',
        group: 'Setting'
    },
    dataConnector: {
        title: 'data-connector',
        icon: 'mdi-power-plug',
        group: 'Setting',
        link: '/data-connector'
    }
};
