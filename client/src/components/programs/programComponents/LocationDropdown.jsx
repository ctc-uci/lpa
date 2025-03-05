import {
    Select,
} from "@chakra-ui/react"

import {DollarIcon} from '../../../assets/DollarIcon';
import {LocationIcon} from '../../../assets/LocationIcon';

export const LocationDropdown = ( { locations, locationRate, selectedLocationId, setSelectedLocation, setSelectedLocationId, setRoomDescription, setLocationRate }) => {
  return (
    <div id="location">
        <LocationIcon />
        {locations && locations.length > 0 ? (
                <Select width="30%" backgroundColor="#FFF"  value={selectedLocationId === "" ? 'DEFAULT' : selectedLocationId}
                onChange={(event) => {
                    const selectedId = parseInt(event.target.value);
                    const location = locations.find(loc => loc.id === selectedId);
                    setSelectedLocation(location.name);
                    setSelectedLocationId(location.id);
                    setRoomDescription(location.description);
                    setLocationRate(location.rate);
                }}
                >
                <option value={'DEFAULT'} disabled>Location...</option>
                {locations.map((location) => (
                    <option value={location.id} key={location.id}>
                    {location.name}
                    </option>
                ))}
                </Select>
            ) : <div></div>  }
        <div id="locationRate">
            <DollarIcon />
            <p>{locationRate} / hour</p>
        </div>
    </div>
  )
}
