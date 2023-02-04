/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from './_.contribution.js';
export const registerSYQL = function () {
    registerLanguage({
        id: 'syql',
        extensions: ['.syql'],
        aliases: ['SYQL'],
        loader: function () {
            return import('./sql.js');
        },
    });
};
