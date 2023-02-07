import KeepAliveJob from './keep-alive-job'

export interface JobProps {
  name: string
  alarmInfo: chrome.alarms.AlarmCreateInfo
  callback: (alarmInfo: chrome.alarms.AlarmCreateInfo) => Promise<void>
}

const jobs = [KeepAliveJob]

const Job = {
  async startAllJobs() {
    jobs.forEach((job) => chrome.alarms.create(job.name, job.alarmInfo))
    chrome.alarms.onAlarm.addListener((alarmInfo) => {
      const job = jobs.find((j) => j.name === alarmInfo.name)
      job
        ?.callback(alarmInfo)
        .then()
        .catch((err) => console.error(err))
    })
  },
}

export default Job
