import { DeviceUUID } from 'device-uuid'

// Remove the previous (broken) version of the UUID saved in local storage
try { localStorage.removeItem('nandos-device-id') }
catch(e) {}

const LOCAL_STORAGE_KEY = 'nandos-device-id-2';
let _deviceUUID: string | null = null;

export default {

	get uuid() {
		if (_deviceUUID === null) {
			try {
				_deviceUUID = localStorage.getItem(LOCAL_STORAGE_KEY)
				if(!_deviceUUID) throw new Error('UUID_FOT_FOUND')					
			}
			catch(e) { // called when no uuid found in local storage, or local storage unavailable
				let generator = new DeviceUUID()
				let du = generator.parse()
				_deviceUUID = du.hashMD5([generator.get(), Date.now(), Math.random() * 99999].join(':'))

				try {
					localStorage.setItem(LOCAL_STORAGE_KEY, _deviceUUID)
				}
				catch(e) {
					// If LS isn't available, set the device UUID to null, as we don't want to associate an ID with this device, because it can't be stored/retrieved
					_deviceUUID = null
					console.warn('Nandos Middleware', 'localStorage not available', e)
				}
			}
		}
		return _deviceUUID
	}

}