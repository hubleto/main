import React, { Component, useState } from "react";
import { setUrlParam, deleteUrlParam } from "adios/Helper";
import Calendar from "./Calendar";
import ModalForm from "adios/ModalForm";
import FormActivitySelector from "./FormActivitySelector";
import request from "adios/Request";


interface CalendarMainProps {
  eventSource?: string,
  eventId?: number,
  children: any,
  eventsEndpoint: string,
  views?: string,
  height?: any,
  readonly?: number,
  onCreateCallback?: any
  onDateClick: any,
  onEventClick: any,
  configs?: any,
}

interface CalendarMainState {
  eventSource?: string,
  eventId?: number,
  events: Array<any>,
  showIdActivity?: number,
  dateClicked?: string,
  timeClicked?: string,
  activityFormComponent?: JSX.Element,
  activityFormModalProps?: any,
  newActivity: boolean,
  fSources: Array<string>,
  fOwnership: number,
}

export default class CalendarComponent extends Component<CalendarMainProps, CalendarMainState> {

  refCalendar: any;

  constructor(props) {
    super(props);

    this.refCalendar = React.createRef();

    this.state = {
      eventSource: this.props.eventSource ?? '',
      eventId: this.props.eventId ?? 0,
      events: [],
      showIdActivity: 0,
      dateClicked: "",
      timeClicked: "",
      newActivity: false,
      fSources: Object.keys(this.props.configs),
      fOwnership: 0,
    };
  }

  getCalendarEventsEndpointUrl(eventSource?: string, eventId?: number): string {
    return (
      'calendar/api/get-calendar-events?fOwnership='
      + this.state.fOwnership
      + '&' + this.state.fSources.map((item) => 'fSources[]=' + item).join('&')
      + (eventSource ? '&source=' + eventSource : '')
      + (eventId ? '&id=' + eventId : '')
    );
  }

  componentDidMount() {
    if (this.props.eventSource && this.props.eventId) {
      request.get(
        this.getCalendarEventsEndpointUrl(this.props.eventSource, this.props.eventId),
        {},
        (event: any) => {
          if (event) {
            this.setState({
              eventSource: '',
              eventId: 0,
              activityFormComponent: globalThis.main.renderReactElement(event.SOURCEFORM,
                {
                  id: event.id,
                  showInModal: true,
                  showInModalSimple: true,
                  onClose:() => {this.setState({activityFormComponent: null})},
                  onSaveCallback:() => {this.setState({activityFormComponent: null})}
                }
              )
            });
          }
        }
      );
    }
  }

  renderCell = (eventInfo) => {
    return <>
      <b>{eventInfo.timeText}</b>
      <span style={{marginLeft: 4}}>{eventInfo.event.title}</span>
      <i style={{marginLeft: 4}}>({eventInfo.event.extendedProps.type})</i>
    </>;
  }

  render(): JSX.Element {
    let activityFormModalProps = {
      uid: 'activity_form',
      isOpen: true,
      type: 'right',
      ...this.state.activityFormModalProps
    };

    return <div className="flex gap-2">
      <div className="flex flex-col gap-2 text-nowrap mt-2">
        <b>Calendars</b>
        <div className="list">
          {Object.keys(this.props.configs).map((source: any) => {
            const calendar = this.props.configs[source];

            return <button
              className="btn btn-small btn-list-item btn-transparent"
              style={{"borderLeft": "1em solid " + calendar.color}}
              onClick={() => {
                let fSources: Array<string> = [];
                if (this.state.fSources.includes(source)) {
                  for (let i in this.state.fSources) {
                    if (this.state.fSources[i] != source) fSources.push(this.state.fSources[i]);
                  }
                } else {
                  fSources = this.state.fSources;
                  fSources.push(source);
                }

                this.setState({fSources: fSources});
              }}
            >
              <span className="icon"><input type="checkbox" checked={this.state.fSources.includes(source)}></input></span>
              <span className="text">{calendar.title}</span>
            </button>;
          })}
        </div>

        <b>Ownership</b>
        <div className="list">
          <button
            className={"btn btn-small btn-list-item " + (this.state.fOwnership == 0 ? "btn-primary" : "btn-transparent")}
            onClick={() => { this.setState({fOwnership: 0}); }}
          ><span className="text">All</span></button>
          <button
            className={"btn btn-small btn-list-item " + (this.state.fOwnership == 1 ? "btn-primary" : "btn-transparent")}
            onClick={() => { this.setState({fOwnership: 1}); }}
          ><span className="text">My activities</span></button>
        </div>
      </div>
      <div className="w-full">
        <Calendar
          ref={this.refCalendar}
          readonly={false}
          views={"timeGridDay,timeGridWeek,dayGridMonth,listYear"}
          height={this.props.height}
          initialView="timeGridWeek"
          eventsEndpoint={globalThis.main.config.accountUrl + '/' + this.getCalendarEventsEndpointUrl()}
          onEventsLoaded={(events) => {
            // for (let i in events) {
            //   if (
            //     !this.state.activityFormComponent
            //     && events[i].extendedProps?.source == this.state.eventSource
            //     && events[i].id == this.state.eventId
            //   ) {

            //     this.setState({
            //       eventSource: '',
            //       eventId: 0,
            //       activityFormComponent: globalThis.main.renderReactElement(events[i].extendedProps.SOURCEFORM,
            //         {
            //           id: events[i].id,
            //           showInModal: true,
            //           showInModalSimple: true,
            //           onClose:() => {this.setState({activityFormComponent: null})},
            //           onSaveCallback:() => {this.setState({activityFormComponent: null})}
            //         }
            //       )
            //     });
            //   }
            // }
          }}
          onDateClick={(date, time, info) => {
            deleteUrlParam('eventSource');
            deleteUrlParam('eventId');

            this.setState({
              activityFormComponent: null,
              newActivity: true,
              dateClicked: date,
              timeClicked: info.view.type == "dayGridMonth" ? null : time
            });
          }}
          onEventClick={(info) => {
            setUrlParam('eventSource', info.event.extendedProps.source);
            setUrlParam('eventId', info.event.id);

            this.setState({
              newActivity: false,
              // activityFormModalProps: info.event.extendedProps.SOURCEFORM_MODALPROPS,
              activityFormComponent: globalThis.main.renderReactElement(info.event.extendedProps.SOURCEFORM,
                {
                  id: info.event.id,
                  showInModal: true,
                  showInModalSimple: true,
                  onClose:() => {this.setState({activityFormComponent: null})},
                  onSaveCallback:() => {this.setState({activityFormComponent: null})}
                }
              )
            });
            info.jsEvent.preventDefault();
          }}
        ></Calendar>
      </div>
      {this.state.activityFormComponent ?
        <ModalForm {...activityFormModalProps}>
          {this.state.activityFormComponent}
        </ModalForm>
      : <></>}
      {this.state.newActivity ?
        <ModalForm
          uid='activity_new_form'
          isOpen={true}
          type='right'
        >
          <FormActivitySelector
            onCallback={() => this.setState({newActivity: false})}
            calendarConfigs={this.props.configs}
            clickConfig={{
              date: this.state.dateClicked,
              time: this.state.timeClicked
            }}
          />
        </ModalForm>
      : <></>}
    </div>;
  }
}
