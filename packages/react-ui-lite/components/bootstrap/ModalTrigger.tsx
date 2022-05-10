import React, { useState } from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";

export const ModalTrigger = (props: {
  openCallback?: () => void;
  closeCallback?: () => void;
  onClick?: () => void;
  trigger?: any;
  component?: any;
  children?: any;
  label?: string | React.ReactNode;
  size?: string;
  className?: string;
  dialogClassName?: string;
  title?: string | React.ReactNode;
  modalProps?: any;
  header?: any;
  footer?: any;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { onClick, openCallback, closeCallback } = props;

  const clickHandler = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    openModal();
  };

  const openModal = () => {
    if (openCallback) {
      openCallback();
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    if (closeCallback) {
      closeCallback();
    }
    setModalIsOpen(false);
  };
  const Components = useVulcanComponents();

  const {
    trigger,
    component,
    children,
    label,
    size,
    className,
    dialogClassName,
    title,
    modalProps,
    header,
    footer,
  } = props;

  let triggerComponent = trigger || component;
  triggerComponent = triggerComponent ? (
    <span onClick={clickHandler}>{triggerComponent}</span>
  ) : (
    <Components.Button onClick={clickHandler}>{label}</Components.Button>
  );
  const childrenComponent = React.cloneElement(children, {
    closeModal,
  });
  const headerComponent = header && React.cloneElement(header, { closeModal });
  const footerComponent = footer && React.cloneElement(footer, { closeModal });

  return (
    <div className="modal-trigger">
      {triggerComponent}
      <Components.Modal
        size={size}
        className={className}
        show={modalIsOpen}
        onHide={closeModal}
        dialogClassName={dialogClassName}
        title={title}
        header={headerComponent}
        footer={footerComponent}
        {...modalProps}
      >
        {childrenComponent}
      </Components.Modal>
    </div>
  );
};
