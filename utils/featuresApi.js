class featuresApi {
    constructor(model, queryStr) {
        this.queryStr = queryStr;
        const queryObj = JSON.parse(JSON.stringify(this.queryStr));
        const excludeFields = ["page", "sort", "limit", "fields", "search"];
        excludeFields.forEach((el) => {
            delete queryObj[el];
        });

        this.query = model.find(queryObj);
    }

    execute() {
        return this.query;
    }

    searchByTour() {
        const includeFields = ["name", "difficulty", "summary", "description"];
        const includeFieldsArr = includeFields.map((el) => ({
            [el]: new RegExp(`${this.queryStr.search?.trim()}`, "i"),
        }));

        this.queryStr.search && this.query.or(includeFieldsArr);

        return this;
    }

    sort() {
        this.queryStr.sort ? this.query.sort(this.queryStr.sort) : this.query.sort("-createdAt");

        return this;
    }

    projecting() {
        this.queryStr.fields && this.query.select(this.queryStr.fields);

        return this;
    }

    paginate() {
        const page = +this.queryStr.page || 1;
        const limit = +this.queryStr.limit || 50;
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = featuresApi;
