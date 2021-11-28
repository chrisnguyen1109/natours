exports.aliasTop5Cheapest = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingAverage price";
    next();
};
