
import React, {  ComponentLifecycle, Fragment  } from "react";
import request from "superagent";
import debounce from "lodash.debounce";
import schema from '.././schema.json';
import { Table } from "react-bootstrap";
import './listView.css';
import InfiniteScroll from 'react-infinite-scroller';
import { Dropdown } from 'react-bootstrap';
import { FaList } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';
import { FaCopy } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';



const jsonData = Object.values(schema.data)
// interface Component<P = {}, S = {}> extends ComponentLifecycle<P, S> { }
class ListView extends React.Component <any, any>  {
    constructor(props:any) {
        super(props);
        this.state = {
          show: false,
          error: false,
          hasMore: true,
          isLoading: false,
          limitData: 60, // in Dom
          limitLoadData:15,
          length: 0,
          values: {},
          users: [],
          directionScroll : 'up'
        };
    window.onscroll = debounce(() => {
        const {
            loadUsers,
            deleteRow,
            editRow,
            copyRow,
            state: {
            error,
            isLoading,
            hasMore,
            },
            } = this;
     if (error || isLoading) return;
     if (
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
          this.setState({directionScroll:'up'});
          if(this.state.length < 10000-this.state.limitLoadData){ // max records 10000
            this.setState({hasMore:true});
          }
            else{
            this.setState({hasMore:false});
            }
        if(this.state.hasMore)
            loadUsers();
      }
      if (document.documentElement.scrollTop <= 0) {
          debugger;
        this.setState({directionScroll:'down'})
        if(this.state.length > 60){
            this.setState({hasMore:true});
          }
            else{
            this.setState({hasMore:false});
            }
            if(this.state.hasMore)
                loadUsers();
      }
    }, 100);

}

  componentWillMount() {
    this.loadUsers();
  }
  loadUsers = () => {
    var direction = this.state.directionScroll;
      var dataShow:any = {length:this.state.length , direction:direction};
      this.setState({ isLoading: true }, () => {
      request.get('http://localhost:4000',dataShow)
        .then((results) => {
            const schemaDate:any = schema.data;
             let nextUsers:any =[];
             results.body.forEach((data:any) => {
                var object:any ={};
                Object.keys(schemaDate).map((key:any) => {
                    object[schemaDate[key]['fieldName']] = data[schemaDate[key]['fieldName']]
                   })
                object._id = data._id;
                nextUsers.push(object);
            });
        if(this.state.users.length>=this.state.limitData){ //check if need to delete previous data
            if(direction == "up"){
                this.setState({
                    users: [
                        ...this.state.users.slice(this.state.limitLoadData), //delete from start
                        ...nextUsers,
                    ],
                  });
            document.documentElement.scrollTop = document.documentElement.scrollTop-200; // move the scroller place

            }
            else{
                this.setState({
                    users: [
                        ...nextUsers,
                        ...this.state.users.slice(0, this.state.users.length-this.state.limitLoadData) //delete from end
                    ],
                  });
            document.documentElement.scrollTop = document.documentElement.scrollTop+200;// move the scroller place
            }
        }
        else{
        this.setState({
          users: [
          ...this.state.users,
            ...nextUsers,
          ],
        });
    }
          this.setState({
            isLoading: false,
            length :  this.state.directionScroll =='up' ? this.state.length + nextUsers.length : this.state.length- nextUsers.length, // save the last place of row - to load from here
          });

        })
        .catch((err) => {
          this.setState({
            error: err.message,
            isLoading: false,
           });
        })
    });
  }
    deleteRow = (d:any) =>{
        const _id = d._id;
        request.delete(`http://localhost:4000/${_id}` , _id)
        .then((results) => {
            var index = this.state.users.findIndex((x:any) => x._id ===_id); // get the place in arrey
            const reducedArr = [...this.state.users];
            reducedArr.splice(index, 1);
            this.setState({users: reducedArr})
        })
        .catch((err) => {
            alert("error in deleting!")
        })
    }
    openCloseModel = ()=> {
        this.setState({show:!this.state.show})
        if(!this.state.show)
            this.setState({values : []}); //reset values modal

    }
    editRow = (dataId:any) =>{
        var id:any = dataId._id;
        const data:any = {valueForm:this.state.values, id:id};
        request.patch('http://localhost:4000', data)
        .then((results) => {
            let users = [...this.state.users];
            var index = this.state.users.findIndex((x:any) => x._id ===id); // get the place in arrey
            let user = {...users[index]};
            let value:any = this.state.values;
             Object.keys(value).map(function(key) {
                 user[key] = value[key];
                });
            users[index] = user;
            this.setState({users});
        })
        .catch((err) => {
            alert("error in deleting!")
        })
        this.openCloseModel();

    }
    copyRow = (d:any) =>{
        const saveId:any = d._id;
        delete d._id;
        const data = d;
        request.post('http://localhost:4000/add',data)
        .then((results) => {
            const newData = results?.body;
            delete newData.__v ;
            const objectArray = new Array(newData);
            this.setState({
                users: [
                    ...objectArray,
                    ...this.state.users
                ],
              });
        })
        .catch((err) => {
            alert("error in duplicate!")
        })
        d._id = saveId;
    }
    handleChange(i:any, event:any) { // get the update input value
        let values = this.state.values;
        values[i] = event.target.value;
        this.setState({ values });
     }

  render() {
    const loader = <div className="loader">Loading ...</div>;
    const {
      error,
      hasMore,
      isLoading,
      users,
    } = this.state;

    return (
        <div>
        <h1>{schema.name}</h1>
        <p>Scroll down to load more!!</p>
        <InfiniteScroll
                pageStart={this.state.limitLoadData}
                loadMore={(e) => this.loadUsers}
                hasMore={this.state.hasMore}
                loader={loader}
                useWindow={false}>
                <div className="tracks">
                <Table striped bordered hover variant="dark">
            <thead>
                <tr>
                <th>#</th>
                <th>action</th>
                {jsonData.map((col:any , index:any) => (
                     <Fragment key={index}>
                        <th>{col.fieldName}</th>
                    </Fragment>
                ))}
                </tr>
            </thead>
            <tbody>
                {users.map((data:any , index:any) => (
                     <tr>
                     <td><input type="checkbox"></input></td>
                    <div className="dropdown">
                        <Dropdown>
                        <Dropdown.Toggle
                            variant="secondary btn-sm"
                            id="dropdown-basic">
                            <FaList />
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{backgroundColor:'#73a47'}}>
                            <Dropdown.Item href="#"  onClick={() =>  this.deleteRow(data)}><FaTrash/> Delete</Dropdown.Item>
                            <Dropdown.Item href="#"  onClick={() =>  this.openCloseModel()}><FaEdit /> Edit</Dropdown.Item>
                            <Modal show={this.state.show} onHide={() => { this.openCloseModel() }}>
                            <Modal.Header closeButton>
                            <Modal.Title>Modal heading</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                            <form>
                            {jsonData.map((col:any , i:any) => (
                            <Fragment key={index}>
                                <div>
                                    <label>{col.fieldName}</label>
                                    <input id={col.fieldName} name={col.fieldName} type={col.type} defaultValue={data[col.fieldName]} onChange={this.handleChange.bind(this, col.fieldName)} ></input>
                                </div>
                            </Fragment>
                        )     )}
                            <button type="button" onClick={() => {this.editRow(data)}}className="btn btn-primary">Update </button>
                            </form>

                            </Modal.Body>
                        </Modal>
                            <Dropdown.Item href="#"  onClick={() =>  this.copyRow(data)}><FaCopy /> Duplicate</Dropdown.Item>
                        </Dropdown.Menu>
                        </Dropdown>
                    </div>
                     <Fragment key={data.index}>
                    {jsonData.map((col:any) =>{
                        return (
                                <td>{data[col.fieldName]}</td>
                        )
                    })}
                    </Fragment>
                    </tr>

                ))}
            </tbody>
            </Table>                </div>
            </InfiniteScroll>
        <hr />
        {error &&
          <div style={{ color: '#900' }}>
            {error}
          </div>
        }
        {isLoading &&
          <div>Loading...</div>
        }
        {!hasMore &&
          <div>You did it! You reached the end!</div>
        }
      </div>

    )
  }


}

export default ListView