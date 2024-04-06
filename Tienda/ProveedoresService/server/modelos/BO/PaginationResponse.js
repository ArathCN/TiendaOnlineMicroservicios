class PaginationResponse {
    constructor (totalItems, pageSize, page, totalPages) {
        this.totalItems = totalItems;
        this.pageSize = pageSize;
        this.page = page;
        this.totalPages = totalPages;
    }
}

module.exports = PaginationResponse;