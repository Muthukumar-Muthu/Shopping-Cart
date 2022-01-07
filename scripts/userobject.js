async function validate(username, password) {
    let userobject = false;
    const respnose = await fetch("https://fakestoreapi.com/users");
    const respnoseJson = await respnose.json();
    console.log(respnoseJson);
    respnoseJson.forEach((element) => {
        if (element.username === username && element.password === password) {
            console.log(element);
            userobject = element;
        }
    });
    return userobject;
}
export { validate };