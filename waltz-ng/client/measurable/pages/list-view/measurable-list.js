/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017 Waltz open source project
 * See README.md for more information
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import _ from 'lodash';
import {initialiseData} from '../../../common';
import {CORE_API} from '../../../common/services/core-api-utils';
import {nest} from "d3-collection";


const initialState = {
    tabs: [],
    visibility: {
        tab: null
    },
};


function prepareTabs(categories = [], measurables = [], counts = []) {
    const countsById = _.keyBy(counts, 'id');

    const measurablesByCategory = _.chain(measurables)
        .map(m => {
            const directCount = (countsById[m.id] || { count: 0 }).count;
            return Object.assign({}, m, { directCount })
        })
        .groupBy('categoryId')
        .value();

    const tabs = _.map(categories, c => {
        return {
            category: c,
            measurables: measurablesByCategory[c.id]
        };
    });

    return _.sortBy(
        tabs,
        g => g.category.name);
}


function findFirstNonEmptyTab(tabs = []) {
    const tab = _.find(tabs, t => (t.measurables || []).length > 0);
    return _.get(tab || tabs[0], 'category.id');
}


function controller($location,
                    $q,
                    $state,
                    $stateParams,
                    serviceBroker,
                    settingsService) {

    const vm = initialiseData(this, initialState);

    const measurablePromise = serviceBroker
        .loadAppData(CORE_API.MeasurableStore.findAll)
        .then(r => r.data);

    const measurableCategoryPromise = serviceBroker
        .loadAppData(CORE_API.MeasurableCategoryStore.findAll)
        .then(r => vm.categories = r.data);

    const countPromise = serviceBroker
        .loadViewData(CORE_API.MeasurableRatingStore.countByMeasurable)
        .then(r => r.data);

    const defaultCategoryPromise = settingsService.findOrDefault("settings.measurable.default-category");

    $q.all([measurablePromise, measurableCategoryPromise, countPromise, defaultCategoryPromise])
        .then(([measurables = [], categories = [], counts = [], defaultCategory]) => {
            vm.tabs = prepareTabs(categories, measurables, counts);
            vm.measurablesByCategoryThenExternalId = nest()
                .key(d => d.categoryId)
                .key(d => d.externalId)
                .rollup(vs => vs[0])
                .object(measurables);
            vm.visibility.tab = $stateParams.category || defaultCategory || findFirstNonEmptyTab(vm.tabs);
        });

    measurableCategoryPromise
        .then((cs) => serviceBroker
            .loadViewData(CORE_API.SvgDiagramStore.findByGroups, [_.map(cs, c => `NAVAID.MEASURABLE.${c.id}`)]))
        .then(r => vm.diagramsByCategory = _.groupBy(r.data, d => d.group.replace('NAVAID.MEASURABLE.', '')));

    measurableCategoryPromise
        .then(cs => vm.categoriesById = _.keyBy(cs, 'id'));

    vm.blockProcessor = b => {
        const extId = b.value;
        const measurable = vm.measurablesByCategoryThenExternalId[vm.visibility.tab][extId];
        if (measurable) {
            b.block.onclick = () => $state.go('main.measurable.view', { id: measurable.id });
            angular.element(b.block).addClass('clickable');
        } else {
            console.log(`MeasurableList: Could not find measurable with external id: ${extId}`, b)
        }
    };

    vm.onTabSelect = (tab) => {
        $location.search('category', tab.category.id)
    };

}


controller.$inject = [
    '$location',
    '$q',
    '$state',
    '$stateParams',
    'ServiceBroker',
    'SettingsService'
];


export default {
    template: require('./measurable-list.html'),
    controller,
    controllerAs: 'ctrl'
};
