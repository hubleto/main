import React, { Component } from 'react'
import Table, { TableProps, TableState } from 'adios/Table';
import FormLead, { FormLeadProps } from './FormLead';
import request from 'adios/Request';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

export interface TableLeadsProps extends TableProps {
  idCustomer?: number,
  showArchive?: boolean,
}

export interface TableLeadsState extends TableState {
  showArchive: boolean,
}

export default class TableLeads extends Table<TableLeadsProps, TableLeadsState> {
  static defaultProps = {
    ...Table.defaultProps,
    orderBy: {
      field: "id",
      direction: "desc"
    },
    formUseModalSimple: true,
    model: 'HubletoApp/Community/Leads/Models/Lead',
  }

  props: TableLeadsProps;
  state: TableLeadsState;

  translationContext: string = 'HubletoApp\\Community\\Leads\\Loader::Components\\TableLeads';

  constructor(props: TableLeadsProps) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  getStateFromProps(props: TableLeadsProps) {
    return {
      ...super.getStateFromProps(props),
      showArchive: props.showArchive ?? false,
    }
  }

  getFormModalProps(): any {
    let params = super.getFormModalProps();
    params.type = (this.props.idCustomer ? 'inside-parent' : 'right wide');
    return params;
  }

  getEndpointParams(): any {
    return {
      ...super.getEndpointParams(),
      idCustomer: this.props.idCustomer,
      showArchive: this.props.showArchive ? 1 : 0,
    }
  }

  renderCell(columnName: string, column: any, data: any, options: any) {
    if (columnName == "tags") {
      return (
        <>
          {data.TAGS.map((tag, key) => {
            return <div style={{backgroundColor: tag.TAG.color}} className='badge' key={data.id + '-tags-' + key}>{tag.TAG.name}</div>;
          })}
        </>
      );
    } else if (columnName == "DEAL") {
      if (data.DEAL) {
        return <>
          <a
            className="btn btn-transparent btn-small"
            href={"deals/" + data.DEAL.id}
            target="_blank"
          >
            <span className="icon"><i className="fas fa-arrow-right"></i></span>
            <span className="text">{data.DEAL.identifier}</span>
          </a>
        </>
      } else {
        return null;
      }
    } else {
      return super.renderCell(columnName, column, data, options);
    }
  }

  onAfterLoadTableDescription(description: any) {
    description.columns['DEAL'] = {
      type: 'varchar',
      title: globalThis.main.translate('Deal'),
    };

    return description;
  }

  renderForm(): JSX.Element {
    let formProps = this.getFormProps() as FormLeadProps;
    formProps.customEndpointParams.idCustomer = this.props.idCustomer;
    formProps.customEndpointParams.showArchive = this.props.showArchive ?? false;
    return <FormLead {...formProps}/>;
  }
}