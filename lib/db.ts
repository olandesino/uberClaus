let rides = []

export function getRides() {
  return rides
}

export function addRide(ride) {
  rides.push(ride)
  return ride
}

export function updateRide(id, updates) {
  const index = rides.findIndex(ride => ride.id === id)
  if (index !== -1) {
    rides[index] = { ...rides[index], ...updates }
    return rides[index]
  }
  return null
}