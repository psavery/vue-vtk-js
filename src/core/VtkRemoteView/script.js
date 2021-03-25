import vtkRemoteView from 'vtk.js/Sources/Rendering/Misc/RemoteView';

export default {
  name: 'VtkRemoteView',
  props: {
    id: {
      type: String,
      default: '-1',
    },
    wsClient: {
      type: Object,
    },
    interactiveRatio: {
      type: Number,
    },
    enablePicking: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      connected: false,
    };
  },
  created() {
    this.view = vtkRemoteView.newInstance({
      rpcWheelEvent: 'viewport.mouse.zoom.wheel',
    });
    if (this.interactiveRatio) {
      this.view.setInteractiveRatio(this.interactiveRatio);
    }

    // Resize handling
    this.resizeObserver = new ResizeObserver(this.view.resize);

    // Bind remote view method to component
    this.resize = this.view.resize;
    this.render = this.view.render;
    this.resetCamera = this.view.resetCamera;
    // -- set
    this.setInteractiveQuality = this.view.setInteractiveQuality;
    this.setInteractiveRatio = this.view.setInteractiveRatio;
    this.setStillQuality = this.view.setStillQuality;
    this.setStillRatio = this.view.setStillRatio;
    // -- get
    this.getInteractiveQuality = this.view.getInteractiveQuality;
    this.getInteractiveRatio = this.view.getInteractiveRatio;
    this.getStillQuality = this.view.getStillQuality;
    this.getStillRatio = this.view.getStillRatio;
  },
  mounted() {
    const container = this.$refs.vtkContainer;
    this.view.setContainer(container);
    this.resizeObserver.observe(container);
    this.connect();
  },
  methods: {
    connect() {
      if (this.wsClient) {
        const session = this.wsClient.getConnection().getSession();
        this.view.setSession(session);
        this.view.setViewId(this.id);
        this.connected = true;
        this.view.render();
      }
    },
  },
  watch: {
    wsClient() {
      this.connect();
    },
    viewId(id) {
      if (this.connected) {
        this.view.setViewId(id);
        this.view.render();
      }
    },
    enablePicking(value) {
      this.view.getInteractorStyle().setSendMouseMove(value);
    },
    interactiveRatio(value) {
      this.view.setInteractiveRatio(value);
    },
  },
  beforeDestroy() {
    // Stop size listening
    this.resizeObserver.disconnect();
    this.resizeObserver = null;

    this.view.delete();
    this.view = null;
  },
};
