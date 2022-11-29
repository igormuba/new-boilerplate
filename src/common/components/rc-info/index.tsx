import React, { useEffect, useState } from 'react'
import { Button, Card, Row, Col, Modal } from "react-bootstrap";
import { _t } from "../../i18n";
import { findRcAccounts } from "../../api/hive";
import { ResourceCreditsDelegation } from "../rc-delegation"
import { RcDelegationsInList } from '../rc-delegations-in-list';

export const ResourceCreditsInfo = (props: any) => {

    const [showRcInfo, setShowRcInfo] = useState(false);
    const [delegated, setDelegated] = useState();
    const [receivedDelegation, setReceivedDelegation] = useState();
    const [resourceCredit, setresourceCredit] = useState();
    const [showDelegationModal, setShowDelegationModal] = useState(false)
    const [showDelegationsList, setShowDelegationsList] = useState(false)

    const { rcPercent, account, activeUser } = props;

    useEffect(() => {
        findRcAccounts(account.name).then((r) => {
            const outGoing = r.map((a: any) => a.delegated_rc);
            const delegated = outGoing[0]
            const formatOutGoing: any =  rcFormatter(delegated)
            setDelegated(formatOutGoing);
            const availableResourceCredit: any = r.map((a: any) => a.rc_manabar.current_mana);
            const formatRc: any = rcFormatter(Number(availableResourceCredit));
            setresourceCredit(formatRc);
            const inComing: any = r.map((a: any) => Number(a.received_delegated_rc));
            const formatIncoming = rcFormatter(inComing);
            setReceivedDelegation(formatIncoming);
          })
    }, []);

    const rcFormatter = (num: number) => {
      const result: any = 
      Math.abs(num) > 999 && Math.abs(num) < 1000000 ? 
      Math.sign(num) * parseFloat((Math.abs(num)/1000).toFixed(2)) + 'k' : 
      Math.abs(num) > 999999 && Math.abs(num) < 1000000000 ? 
      Math.sign(num) * parseFloat((Math.abs(num)/1000000).toFixed(2)) + "m" : 
      Math.abs(num) > 999999999 && Math.abs(num) < 1000000000000000 ? 
      Math.sign(num) * parseFloat((Math.abs(num)/1000000000).toFixed(2)) + "b" : 
      Math.sign(num)*Math.abs(num);
      return result
  }

    const showModal = () => {
        setShowRcInfo(true);
    };

    const hideModal = () => {
        setShowRcInfo(false);
    };

    const showDelegation = () => {
      setShowDelegationModal(true);
      setShowRcInfo(false);
    };
    
    const hideDelegation = () => {
      setShowDelegationModal(false);
    };

    const showList = () => {
      setShowDelegationsList(true)
  };

    const hideList = () => {
      setShowDelegationsList(false)
  };
  return (
      <div>
        <div className="progress" onClick={showModal}>
          <div
          className="progress-bar progress-bar-success"
          role="progressbar"
          style={{ width: `${rcPercent}%`,  cursor:"pointer" }}
          >
          {_t("rc-info.available")}
          </div>
          <div
          className="progress-bar progress-bar-danger"
          role="progressbar"
          style={{ width: `${100 - rcPercent}%`, cursor:"pointer" }}
          >
          {_t("rc-info.used")}
          </div>
      </div>

    <Modal size='lg' width={'90%'}
      animation={false}
      show={showRcInfo}
      centered={true}
      onHide={hideModal}
      keyboard={false}
      className="purchase-qr-dialog"
      dialogClassName="modal-90w"
      >
      <Modal.Header closeButton={true}>
        <Modal.Title>
          <span className="d-flex justify-content-center">
            {_t("rc-info.resource-credits")}
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <Card className="d-flex justify-content-center">
            <Card.Header>{_t("rc-info.resource-credit")}</Card.Header>
            <Card.Body className="card-body">
            <Card.Text className="justify-content-center">
               {resourceCredit}
            </Card.Text>
            </Card.Body>
            </Card>
          </Col>  

          <Col>
            <Card className="d-flex justify-content-center">
            <Card.Header>{_t("rc-info.rc-available")}</Card.Header>
            <Card.Body className="card-body">
            <Card.Text>
               {`${rcPercent}%`}
            </Card.Text>
            </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="d-flex justify-content-center">            
            <Card.Header>{_t("rc-info.rc-used")}</Card.Header>
            <Card.Body className="card-body">
            <Card.Text>
               {`${(100 - rcPercent).toFixed(2)}%`}
            </Card.Text>
            </Card.Body>
            </Card>
          </Col>

          <Col onClick={showList} className="cursor-pointer">
            <Card className="d-flex justify-content-center">            
            <Card.Header>{_t("rc-info.delegated")}</Card.Header>
            <Card.Body className="card-body">
            <Card.Text>
               {delegated}
            </Card.Text>
            </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="d-flex justify-content-center">            
            <Card.Header>{_t("rc-info.received-delegations")}</Card.Header>
            <Card.Body className="card-body">
            <Card.Text>
               {receivedDelegation}
            </Card.Text>
            </Card.Body>
            </Card>
          </Col>
        </Row>  
        <div className="d-flex justify-content-center mt-3">
            <Button onClick={showDelegation}>
             {_t("rc-info.delegation-button")}
            </Button> 
        </div>
      </Modal.Body>
    </Modal>

    <Modal 
    onHide={hideList} 
    show={showDelegationsList} 
    centered={true} 
    animation={false} 
    size="lg">
    <Modal.Header closeButton={true}>
      <Modal.Title>{_t("rc-info.delegatees")}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
    <RcDelegationsInList 
    activeUser={activeUser} 
    rcFormatter={rcFormatter} 
    delegated={delegated} 
    showDelegation={showDelegation} 
    hideList={hideList}
    />    
    </Modal.Body>
  </Modal>    
          
    <div>
    <Modal
      animation={false}
      show={showDelegationModal}
      centered={true}
      onHide={hideDelegation}
      keyboard={false}
      className="transfer-dialog modal-thin-header"
      size="lg"
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>
          {/* {formHeader1} */}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <ResourceCreditsDelegation 
      {...props} 
      activeUser={activeUser} 
      resourceCredit={resourceCredit} 
      hideDelegation={hideDelegation} 
      />
      </Modal.Body>
    </Modal>
    </div>     
    </div>
  );
};
