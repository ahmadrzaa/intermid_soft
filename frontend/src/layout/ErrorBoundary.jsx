import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ console.error("UI Error:", error, info); }
  render(){
    if(this.state.hasError){
      return (
        <div style={{maxWidth:800, margin:"40px auto", padding:16, border:"1px solid #fbb", borderRadius:12, background:"#fff0f0"}}>
          <h2 style={{marginTop:0}}>Something broke in this screen</h2>
          <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
