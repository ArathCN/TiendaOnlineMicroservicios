import PaginationConstants from '../constantes/PaginationConstants.js';

class Pagination {
    constructor (paginationObject) {
        if(paginationObject === undefined){
            this.pageSize = PaginationConstants.PAGE_SIZE;
            this.sort = PaginationConstants.DEFAULT_SORT;
            this.page = PaginationConstants.DEFAULT_PAGE;
        }else{
            this.pageSize = PaginationConstants.PAGE_SIZE;
            this.sort = paginationObject.sort;
            this.page = paginationObject.page;
        }
        
    }

}

export default Pagination;