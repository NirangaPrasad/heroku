const day = ()=>{
    let day = new Date()
    let currentDay = ""

    let options = {
        weekday: "long",
        month:"long",
        day:"numeric"
    }
    currentDay = day.toLocaleDateString("en-US", options)
    return currentDay
}

module.exports = day
