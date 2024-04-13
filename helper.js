function getParametrizedParamList(req) {
    const paramComponentList = req.params[0].replace("/", "").split("/")
    const parametirizedParamList = []
    for (const component of paramComponentList) {
        let argNum = 1
        if (parseInt(component)) {
            console.log(`component ${component} is number`)
            parametirizedParamList.push(`Arg${argNum}`)
            argNum++
        } else if (new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i').test(component)) {
            console.log(`component ${component} is guid`)
            parametirizedParamList.push(`Arg${argNum}`)
            argNum++
        } else {
            parametirizedParamList.push(component)
        }
    }
    return parametirizedParamList;
}

module.exports = {
    getParametrizedParamList: getParametrizedParamList
}