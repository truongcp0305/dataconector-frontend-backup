function getData() {
    const urlGo = 'https://master--kanban-go--dev.webix.io';
    const urlNode = 'https://master--kanban-node--dev.webix.io';

    const users = [
        {
            id: 1,
            label: 'Steve Smith',
            path: '../assets/user.jpg',
        },
        {
            id: 2,
            label: 'Aaron Long',
            path: '../assets/user-2.jpg',
        },
        {
            id: 3,
            label: 'Angela Allen',
            path: '../assets/user-3.jpg',
        },
        {
            id: 4,
            label: 'Angela Long',
            path: '../assets/user-4.jpg',
        },
        {
            id: 5,
            label: 'John Doe',
        },
    ];

    const cardShape = {
        label: true,
        description: true,
        progress: true,
        start_date: true,
        end_date: true,
        users: {
            show: true,
            values: users,
        },
        priority: {
            show: true,
            values: [
                { id: 1, color: '#FF5252', label: 'high', value: 1 },
                { id: 2, color: '#FFC975', label: 'medium', value: 2 },
                { id: 3, color: '#65D3B3', label: 'low', value: 3 },
            ],
        },
        color: true,
        menu: true,
        cover: true,
        attached: false,
    };

    const editorShape = [
        {
            type: 'multiselect',
            key: 'users',
            label: 'Users',
            options: users,
        },
        /*{
			key: "attached",
			type: "files",
			label: "Files",
			uploadURL: urlGo + "/data",
			config: {
				multiple: true,
			},
		},*/
    ];

    const columns = [
        {
            label: 'Backlog',
            id: 'backlog',
        },
        {
            label: 'In progress',
            id: 'inprogress',
        },
        {
            label: 'Testing',
            id: 'testing',
        },
        {
            label: 'Done',
            id: 'done',
        },
    ];

    const rows = [
        {
            label: 'Feature',
            id: 'feature',
        },
        {
            label: 'Task',
            id: 'task',
            // collapsed: true,
        },
    ];

    const start_date = new Date('01/07/2021');
    const end_date = new Date('01/15/2021');

    const cards = [
        {
            label: 'Integration with Angular/React',
            priority: 1,
            color: '#65D3B3',
            start_date: new Date('01/07/2021'),
            users: [3, 2],
            column: 'NEW',
        },
        {
            label: 'Archive the cards/boards ',
            priority: 3,
            color: '#58C3FE',
            users: [5],
            progress: 1,
            column: 'DONE',
        },
        {
            label: 'Searching and filtering',
            priority: 1,
            color: '#58C3FE',
            start_date: new Date('01/09/2021'),
            users: [3, 1],
            progress: 1,
            column: 'NEW',
        },
        {
            label: 'Set the tasks priorities',
            color: '#FFC975',
            start_date: new Date('12/21/2020'),
            users: [4],
            progress: 75,
            column: 'DONE',
        },
        {
            label: 'Custom icons',
            color: '#65D3B3',
            start_date: new Date('01/07/2021'),
            users: [3, 2],
            column: 'TEST',
        },
        {
            label: 'Integration with Gantt',
            color: '#FFC975',
            start_date: new Date('12/21/2020'),
            users: [4],
            progress: 75,
            column: 'TEST',
        },
        {
            label: 'Drag and drop',
            priority: 1,
            color: '#58C3FE',
            users: [3, 1],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Adding images',
            color: '#58C3FE',
            users: [4],
            column: 'TEST',
        },
        {
            label: 'Create cards and lists from the UI and from code',
            priority: 3,
            color: '#65D3B3',
            start_date: new Date('01/07/2021'),
            users: [3, 2],
            column: 'TEST',
        },
        {
            label: 'Draw swimlanes',
            color: '#FFC975',
            users: [2],
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
        {
            label: 'Progress bar',
            priority: 1,
            color: '#FFC975',
            start_date: new Date('12/9/2020'),
            users: [1, 4, 3],
            progress: 100,
            column: 'TEST',
        },
    ];

    return {
        rows,
        columns,
        cards,
        users,
        cardShape,
        editorShape,
        urlGo,
        urlNode,
    };
}
module.exports = getData;
