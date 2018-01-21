module.exports.controller = function(app) {
    app.get("/", (req, res) => {
        var data = {
            version: "0.2.0"
        };
        res.render("index", data);
    });
}