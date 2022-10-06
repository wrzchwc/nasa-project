const API_URL = 'http://localhost:8000/v1';

export async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();
}

export async function httpGetLaunches() {
  const response = await fetch(`${API_URL}/launches`);
  const launches =  await response.json();
  return launches.sort((a, b) => a.flightNumber - b.flightNumber);
}

export async function httpSubmitLaunch(launch) {
  const init = {method: "post", body: JSON.stringify(launch), headers: {"Content-Type": "application/json"}}
  try {
    return await fetch(`${API_URL}/launches`, init);
  } catch (error) {
    return {ok: false};
  }
}

export async function httpAbortLaunch(id) {
  try{
    return await fetch(`${API_URL}/launches/${id}`, {method: 'delete'});
  } catch (error) {
    return {ok: false};
  }
}