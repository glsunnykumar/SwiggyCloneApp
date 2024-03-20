import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class GoogleMapsService {

  private _places = new BehaviorSubject<any[]>([]);
  private _changeMarker = new BehaviorSubject<any>({});

  get markerChange(){
    return this._changeMarker.asObservable();
  }

  get places(){
    return this._places.asObservable();
  }
  googleMaps :any;

  constructor(private http: HttpClient,
    private zone :NgZone
    ) {}


  

  loadGoogleMaps(): Promise<any> {
    try{
      const win = window as any;
      const gModule = win.google;
      if(gModule && gModule.maps) {
       return Promise.resolve(gModule.maps);
      }
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.src =
          'https://maps.googleapis.com/maps/api/js?key=' +
          environment.googleMapsApiKey
           +'&libraries=places';
       
        script.setAttribute('loading', 'async');
        document.body.appendChild(script);
        
        script.onload = () => {
          const loadedGoogleModule = win.google;
          if(loadedGoogleModule && loadedGoogleModule.maps) {
            resolve(loadedGoogleModule.maps);
          } else {
            reject('Google Map SDK is not Available');
          }
        };
      });
    }
    catch(e){
      console.log(e);
      return null;
    }
   
  }

  async getAddress(lat: number, lng: number): Promise<any> {
    return await new Promise((resolve, reject) => {
        this.http.get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsApiKey}`
        )
        .pipe(
          map(geoData => {
            console.log(geoData);
            if(!geoData || !geoData.results || geoData.results.length === 0){
              console.log('throwing null value');
              throw(null);
            } 
            return geoData.results[0];
          })
        ).subscribe({next :(data)=>{ resolve(data);},error :(e)=>{
          console.log('rejecting promise:' + e);
          reject(e);
        }})
    });
  }

  async getPlaces(query){
    try{
      if(!this.googleMaps){
        this.googleMaps = await this.loadGoogleMaps();
      }
      let googleMaps :any = this.googleMaps;
      let service = new googleMaps.places.AutocompleteService();
      service.getPlacePredictions({
        input :query,
        componentRestrictions :{
          country :'IN'
        }
      } , (predictions) =>{
        let autoCompleteItems =[];
        this.zone.run(()=>{
          if(predictions !=null){
            predictions.forEach(async(prediction) => {
              console.log('prediction' , prediction);
              let latlng:any = await this.geoCode(prediction.description,googleMaps);
              const palces ={
                title  :prediction.structured_formatting.main_text,
                address :prediction.description,
                lat :latlng.lat,
                lng :latlng.lng
              } 
              autoCompleteItems.push(palces);
            });
            this._places.next(autoCompleteItems);
          }
        })
      })
    }
    catch(e){
      console.log(e);
    }
  }

  geoCode(address,googleMaps){
   let latlng ={lat :'',lng:''};
   return new Promise((resolve,reject)=>{
   let geocoder =new googleMaps.Geocoder();
   geocoder.geocode({'address' :address ,},(results,status)=>{
    latlng.lat = results[0].geometry.location.lat();
    latlng.lng = results[0].geometry.location.lng();
    resolve(latlng);
   });
   })
  }

  changeMarkerInMap(location){
    this._changeMarker.next(location);
  }

}
