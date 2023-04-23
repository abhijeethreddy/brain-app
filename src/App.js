import { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation.js'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import Siginin from './components/Siginin/Siginin';
import Register from './components/Register/Register';

const initialState ={
    input: '',
    imageUrl:'',
    box:[],
    route:'signin',
    isSignedIn: false,
    user:{
      id:'',
      name:'',
      email:'',
      count:0,
      joined:''
    }
}
class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      count: data.entries,
      joined: data.joined
    }})
  }
  calculateFaceLocation = (clarifaiFace) => {
    const image=document.getElementById('inputimage');
    const width = Number(image.width);
    const height=Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) =>{
    this.setState({box:box});
  }
  onInputChange=(event)=>{
    this.setState({input:event.target.value})
  }
  onButtonSubmit=()=>{
    this.setState({imageUrl: this.state.input});
      fetch('https://brain-backend-api.onrender.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://brain-backend-api.onrender.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { count: count.entries}))
            })
            .catch(console.log)

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  
  onRouteChange= (route) =>{
    if(route==='signout'){
      this.setState(initialState)
    }
    else if(route === 'home'){
      this.setState({isSignedIn:true})
    }
    this.setState({route: route});
  }
  render(){
    // console.log(this.state.user.count)
    return (
      <div className="App">
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        {  this.state.route==='home'?
              <div>
                <Rank name={this.state.user.name} count={this.state.user.count}/>
                <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
                <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/> 
              </div>
            :(
              this.state.route=== 'signin'?
              <Siginin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;
