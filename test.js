
const body = {
    model: 'gpt-4o-mini',
    messages: [
        {role: 'system', content: 'You are a suspect. Reply in JSON: {\"text\": \"hi\", \"action\": \"nods\"}'},
        {role: 'user', content: 'asdfgh'}
    ],
    response_format: { type: 'json_object' }
};
fetch('https://www.completions.me/api/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-cp_e61dc55ce18a5f438bf2bbb22f45f15c743f6317f9538cff'
    },
    body: JSON.stringify(body)
}).then(r => r.json()).then(data => console.log(JSON.stringify(data))).catch(console.error);

