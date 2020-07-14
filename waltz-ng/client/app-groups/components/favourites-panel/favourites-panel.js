/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017, 2018, 2019 Waltz open source project
 * See README.md for more information
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific
 *
 */


import template from "./favourites-panel.html";

import {initialiseData} from "../../../common/index";
import {CORE_API} from "../../../common/services/core-api-utils";


const bindings = {
};


const initialState = {
    favouritesGroupRef: null
};


function controller(serviceBroker) {
    const vm = initialiseData(this, initialState);

    vm.$onInit = () => {
        serviceBroker.loadViewData(CORE_API.FavouritesStore.getFavouritesGroup)
            .then(r => {
                const favouritesGroup = r.data;
                if(favouritesGroup) {
                    vm.favouritesGroupRef = {
                        id: _.get(favouritesGroup, 'id', null),
                        kind: 'APP_GROUP'
                    }
                }
            })
    };
}


controller.$inject = [
    "ServiceBroker",
];


const component = {
    controller,
    bindings,
    template
};


const id = "waltzFavouritesPanel";


export default {
    id,
    component
}