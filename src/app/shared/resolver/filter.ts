import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FilterFolder, FilterItem, FiltersFacade } from '@repositories/filters-repository';

export const filterResolver: ResolveFn<FilterItem | undefined> = (route) => {
    const filtersFacade = inject(FiltersFacade);
    const id = route.paramMap.get('id');
    console.log(id);
    console.log(filtersFacade.getFilterById(id!));
    console.log(id ? filtersFacade.getFilterById(id) : undefined);
    return id ? filtersFacade.getFilterById(id) : undefined;
};

export const folderResolver: ResolveFn<FilterFolder | undefined> = (route) => {
    const filtersFacade = inject(FiltersFacade);
    const id = route.paramMap.get('id');
    return id ? filtersFacade.getFolderById(id) : undefined;
};
